import { Hono } from 'hono'
import { eq, and, asc, inArray } from 'drizzle-orm'
import type { HonoContext } from '../index'
import { characters, characterMemory, debates, debateTurns } from '../../db/schema'
import { getNextTurn, shouldCompressEpisodic } from '../../ai/debate-engine'
import { assembleCharacterContext } from '../../ai/memory/context-assembly'
import { initWorkingMemory, updateWorkingMemory } from '../../ai/memory/working-memory'
import { compressEpisodicMemory } from '../../ai/memory/episodic-compress'
import { getTurnInstruction } from '../../../lib/debate-formats'
import { anthropic } from '../../ai/client'
import type { DebateFormat, DebateTurn, TurnRole } from '../../../types/debate'
import type { WorkingMemory } from '../../../types/memory'

export const turnRoutes = new Hono<HonoContext>()

// GET /api/debate/turn?debateId=...&characterId=...
// Returns: SSE stream of { delta: string } events, ending with [DONE]
turnRoutes.get('/turn', async (c) => {
  const db = c.get('db')
  const debateId = c.req.query('debateId')
  const characterId = c.req.query('characterId')

  if (!debateId || !characterId) {
    return c.json({ error: 'Missing debateId or characterId query params' }, 400)
  }

  // Validate debate exists
  const debateRows = await db.select().from(debates).where(eq(debates.id, debateId))
  const debate = debateRows[0]
  if (!debate) return c.json({ error: 'Debate not found' }, 404)

  // Determine whose turn it is
  const nextTurn = await getNextTurn(db, debateId)
  if (!nextTurn) return c.json({ error: 'Debate complete — no more turns' }, 409)
  if (nextTurn.characterId !== characterId) {
    return c.json(
      { error: `Not ${characterId}'s turn. Expected: ${nextTurn.characterId}` },
      409,
    )
  }

  // Load participant names
  const participantIds = debate.participantIds as string[]
  const charRows = await db
    .select({ id: characters.id, name: characters.name })
    .from(characters)
    .where(inArray(characters.id, participantIds))

  const nameMap = Object.fromEntries(charRows.map((r) => [r.id, r.name]))
  const speakerName = nameMap[characterId] ?? characterId
  const opponentNames = participantIds.filter((id) => id !== characterId).map((id) => nameMap[id] ?? id)

  // Build turn instruction
  const turnInstruction = getTurnInstruction(
    debate.format as DebateFormat,
    nextTurn.role as TurnRole,
    nextTurn.turnNumber,
    speakerName,
    opponentNames,
  )

  // Assemble full character context (life knowledge + memory + recent turns)
  const context = await assembleCharacterContext(
    db,
    characterId,
    debateId,
    debate.topic,
    debate.format as DebateFormat,
    turnInstruction,
  )

  // Set up bidirectional SSE stream
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()

  const streamAndProcess = async () => {
    let fullText = ''

    // --- Step 1: Stream the character's response via SSE ---
    try {
      const stream = anthropic.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: context.system,
        messages: context.messages,
      })

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const delta = event.delta.text
          fullText += delta
          await writer.write(encoder.encode(`data: ${JSON.stringify({ delta })}\n\n`))
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Streaming error'
      await writer.write(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`))
    } finally {
      await writer.write(encoder.encode('data: [DONE]\n\n'))
      await writer.close()
    }

    if (!fullText) return

    // --- Step 2: Persist the completed turn ---
    await db.insert(debateTurns).values({
      id: crypto.randomUUID(),
      debateId,
      characterId,
      role: nextTurn.role,
      content: fullText,
      turnNumber: nextTurn.turnNumber,
      createdAt: new Date().toISOString(),
    })

    // --- Step 3: Update working memory ---
    const memoryRows = await db
      .select()
      .from(characterMemory)
      .where(and(eq(characterMemory.characterId, characterId), eq(characterMemory.debateId, debateId)))

    const memoryRow = memoryRows[0]
    const priorMemory: WorkingMemory = memoryRow?.workingMemory
      ? (memoryRow.workingMemory as unknown as WorkingMemory)
      : initWorkingMemory(characterId, debateId, debate.topic)

    const updatedMemory = await updateWorkingMemory(characterId, debateId, fullText, priorMemory)

    const now = new Date().toISOString()

    if (memoryRow) {
      await db
        .update(characterMemory)
        .set({ workingMemory: updatedMemory as unknown as Record<string, unknown>, updatedAt: now })
        .where(eq(characterMemory.id, memoryRow.id))
    } else {
      await db.insert(characterMemory).values({
        id: crypto.randomUUID(),
        characterId,
        debateId,
        workingMemory: updatedMemory as unknown as Record<string, unknown>,
        episodicSummary: '',
        updatedAt: now,
      })
    }

    // --- Step 4: Episodic compression (if threshold crossed) ---
    const needsCompression = await shouldCompressEpisodic(db, debateId, characterId)
    if (needsCompression) {
      const charTurns = await db
        .select()
        .from(debateTurns)
        .where(and(eq(debateTurns.debateId, debateId), eq(debateTurns.characterId, characterId)))
        .orderBy(asc(debateTurns.turnNumber))

      const existingSummary = memoryRow?.episodicSummary ?? ''
      const newSummary = await compressEpisodicMemory(
        characterId,
        charTurns as unknown as DebateTurn[],
        existingSummary,
      )

      await db
        .update(characterMemory)
        .set({ episodicSummary: newSummary, updatedAt: new Date().toISOString() })
        .where(and(eq(characterMemory.characterId, characterId), eq(characterMemory.debateId, debateId)))
    }
  }

  // Keep the Worker alive through streaming + background tasks
  if (c.executionCtx?.waitUntil) {
    c.executionCtx.waitUntil(streamAndProcess())
  } else {
    // Non-CF environment (e.g. local Vite dev server)
    streamAndProcess().catch(console.error)
  }

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
      Connection: 'keep-alive',
    },
  })
})
