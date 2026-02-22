import { Hono } from 'hono'
import { eq, asc, inArray } from 'drizzle-orm'
import type { HonoContext } from '../index'
import { characters, characterMemory, debates, debateTurns } from '../../db/schema'
import { initWorkingMemory } from '../../ai/memory/working-memory'
import { anthropic } from '../../ai/client'
import type { DebateFormat } from '../../../types/debate'

export const debatesRoutes = new Hono<HonoContext>()

const VALID_FORMATS: DebateFormat[] = ['oxford', 'lincoln-douglas', 'socratic', 'townhall']

// POST /api/debates — create a new debate
debatesRoutes.post('/', async (c) => {
  const db = c.get('db')
  const body = await c.req.json<{
    topic: string
    format: DebateFormat
    participantIds: string[]
    userParticipating?: boolean
  }>()

  const { topic, format, participantIds, userParticipating = false } = body

  if (!topic?.trim()) return c.json({ error: 'topic is required' }, 400)
  if (!VALID_FORMATS.includes(format)) return c.json({ error: `Invalid format: ${format}` }, 400)
  if (!Array.isArray(participantIds) || participantIds.length < 2 || participantIds.length > 4) {
    return c.json({ error: 'participantIds must be an array of 2–4 character IDs' }, 400)
  }

  // Verify all characters exist
  const charRows = await db
    .select({ id: characters.id, name: characters.name })
    .from(characters)
    .where(inArray(characters.id, participantIds))

  if (charRows.length !== participantIds.length) {
    const found = charRows.map((r) => r.id)
    const missing = participantIds.filter((id) => !found.includes(id))
    return c.json({ error: `Unknown character IDs: ${missing.join(', ')}` }, 400)
  }

  const nameMap = Object.fromEntries(charRows.map((r) => [r.id, r.name]))
  const names = participantIds.map((id) => nameMap[id]).join(' vs. ')
  const title = `${names}: ${topic}`

  const debateId = crypto.randomUUID()
  const now = new Date().toISOString()

  // Insert debate
  await db.insert(debates).values({
    id: debateId,
    title,
    topic,
    format,
    participantIds,
    userParticipating,
    createdAt: now,
  })

  // Insert blank working memory rows for each AI participant
  const memoryInserts = participantIds.map((charId) => ({
    id: crypto.randomUUID(),
    characterId: charId,
    debateId,
    workingMemory: initWorkingMemory(charId, debateId, topic) as unknown as Record<string, unknown>,
    episodicSummary: '',
    updatedAt: now,
  }))

  await db.insert(characterMemory).values(memoryInserts)

  return c.json({ debateId }, 201)
})

// GET /api/debates/:id — get debate with all turns and memory
debatesRoutes.get('/:id', async (c) => {
  const db = c.get('db')
  const debateId = c.req.param('id')

  const [debateRows, turns, memories] = await Promise.all([
    db.select().from(debates).where(eq(debates.id, debateId)),
    db
      .select()
      .from(debateTurns)
      .where(eq(debateTurns.debateId, debateId))
      .orderBy(asc(debateTurns.turnNumber)),
    db.select().from(characterMemory).where(eq(characterMemory.debateId, debateId)),
  ])

  if (!debateRows[0]) return c.json({ error: 'Debate not found' }, 404)

  return c.json({ debate: debateRows[0], turns, memories })
})

// POST /api/debates/:id/turns — submit a user turn
debatesRoutes.post('/:id/turns', async (c) => {
  const db = c.get('db')
  const debateId = c.req.param('id')
  const body = await c.req.json<{ content: string }>()

  if (!body.content?.trim()) return c.json({ error: 'content is required' }, 400)

  const debateRows = await db.select().from(debates).where(eq(debates.id, debateId))
  if (!debateRows[0]) return c.json({ error: 'Debate not found' }, 404)

  const existingTurns = await db
    .select({ id: debateTurns.id })
    .from(debateTurns)
    .where(eq(debateTurns.debateId, debateId))

  const turnNumber = existingTurns.length + 1
  const turnId = crypto.randomUUID()
  const now = new Date().toISOString()

  await db.insert(debateTurns).values({
    id: turnId,
    debateId,
    characterId: null,
    role: 'argument',
    content: body.content,
    turnNumber,
    createdAt: now,
  })

  return c.json({
    turn: {
      id: turnId,
      debateId,
      characterId: null,
      role: 'argument',
      content: body.content,
      turnNumber,
      createdAt: now,
    },
  })
})

// POST /api/topics — AI-generated topic suggestions for a character pair
debatesRoutes.post('/topics', async (c) => {
  const db = c.get('db')
  const body = await c.req.json<{ characterIds: string[] }>()

  if (!Array.isArray(body.characterIds) || body.characterIds.length < 2) {
    return c.json({ error: 'characterIds must be an array of at least 2 IDs' }, 400)
  }

  const charRows = await db
    .select({
      id: characters.id,
      name: characters.name,
      era: characters.era,
      suggestedTopics: characters.suggestedTopics,
      knownPositions: characters.knownPositions,
      coreBeliefs: characters.coreBeliefs,
    })
    .from(characters)
    .where(inArray(characters.id, body.characterIds))

  if (charRows.length < 2) return c.json({ error: 'Could not find the requested characters' }, 404)

  // Build context about each character
  const charContext = charRows
    .map((ch) => {
      const positions = Object.entries(ch.knownPositions as Record<string, string>)
        .slice(0, 3)
        .map(([k, v]) => `  ${k}: ${v}`)
        .join('\n')
      return `**${ch.name}** (${ch.era}):\nCore beliefs: ${(ch.coreBeliefs as string[]).slice(0, 3).join('; ')}\nKey positions:\n${positions}`
    })
    .join('\n\n')

  const names = charRows.map((ch) => ch.name).join(' and ')

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system:
      'You are an expert in intellectual history who specializes in identifying the most thought-provoking and substantive debate topics between historical and contemporary thinkers.',
    messages: [
      {
        role: 'user',
        content: `Suggest 5 compelling debate topics for ${names}.\n\nCharacter profiles:\n${charContext}\n\nReturn exactly 5 specific, argumentative topics where these thinkers would genuinely clash. Phrase them as provocative questions or resolutions.`,
      },
    ],
    tools: [
      {
        name: 'suggest_topics',
        description: 'Return 5 suggested debate topics',
        input_schema: {
          type: 'object' as const,
          properties: {
            topics: {
              type: 'array' as const,
              items: { type: 'string' as const },
              description: 'Five debate topic suggestions',
            },
          },
          required: ['topics'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'suggest_topics' },
  })

  const toolBlock = response.content.find((b) => b.type === 'tool_use')
  if (!toolBlock || toolBlock.type !== 'tool_use') {
    return c.json({ error: 'Failed to generate topics' }, 500)
  }

  const { topics } = toolBlock.input as { topics: string[] }
  return c.json({ topics: topics.slice(0, 5) })
})
