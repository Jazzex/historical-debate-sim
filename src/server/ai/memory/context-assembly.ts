import { asc, eq, and } from 'drizzle-orm'
import type { DbClient } from '../../db'
import type { DebateFormat } from '../../../types/debate'
import type { WorkingMemory } from '../../../types/memory'
import { characterMemory, debateTurns, characters } from '../../db/schema'
import { getLifeKnowledge } from '../life-knowledge'
import { initWorkingMemory } from './working-memory'

export type MessageParam = { role: 'user' | 'assistant'; content: string }

const RECENT_TURNS_WINDOW = 6

export async function assembleCharacterContext(
  db: DbClient,
  characterId: string,
  debateId: string,
  topic: string,
  format: DebateFormat,
  turnInstruction: string,
): Promise<{ system: string; messages: MessageParam[] }> {
  const [lifeKnowledge, memoryRows, allTurns, characterRows] = await Promise.all([
    getLifeKnowledge(characterId),
    db
      .select()
      .from(characterMemory)
      .where(
        and(
          eq(characterMemory.characterId, characterId),
          eq(characterMemory.debateId, debateId),
        ),
      ),
    db
      .select()
      .from(debateTurns)
      .where(eq(debateTurns.debateId, debateId))
      .orderBy(asc(debateTurns.turnNumber)),
    db.select().from(characters).where(eq(characters.id, characterId)),
  ])

  const memoryRow = memoryRows[0]
  const characterRow = characterRows[0]

  const workingMemory: WorkingMemory =
    memoryRow?.workingMemory != null
      ? (memoryRow.workingMemory as unknown as WorkingMemory)
      : initWorkingMemory(characterId, debateId, topic)

  const episodicSummary = memoryRow?.episodicSummary ?? ''
  const recentTurns = allTurns.slice(-RECENT_TURNS_WINDOW)
  const characterName = characterRow?.name ?? characterId

  const system = buildSystemPrompt(
    characterName,
    lifeKnowledge,
    workingMemory,
    episodicSummary,
    topic,
    format,
  )
  const messages = buildMessages(recentTurns, characterId, turnInstruction)

  return { system, messages }
}

function buildSystemPrompt(
  name: string,
  lifeKnowledge: string,
  memory: WorkingMemory,
  episodicSummary: string,
  topic: string,
  format: DebateFormat,
): string {
  const formatLabel: Record<DebateFormat, string> = {
    oxford: 'Oxford',
    'lincoln-douglas': 'Lincoln-Douglas',
    socratic: 'Socratic',
    townhall: 'Town Hall',
  }

  const sections: string[] = [
    `You are ${name}. Speak and reason exactly as this historical figure would, using their authentic voice, vocabulary, and intellectual framework. Do not break character or acknowledge that you are an AI.`,
    `## Your Life and Knowledge\n${lifeKnowledge}`,
    `## Debate Context\nTopic: "${topic}"\nFormat: ${formatLabel[format]}`,
    `## Your Working Memory\n${formatWorkingMemory(memory)}`,
  ]

  if (episodicSummary) {
    sections.push(`## Earlier in This Debate (Your Memory)\n${episodicSummary}`)
  }

  sections.push(
    `## Instructions\nStay completely in character. Draw on your real philosophical positions, historical experiences, and rhetorical style. Respond in the voice and manner of ${name}.`,
  )

  return sections.join('\n\n')
}

function formatWorkingMemory(m: WorkingMemory): string {
  const lines: string[] = []
  if (m.myMainThesis) lines.push(`**My thesis:** ${m.myMainThesis}`)
  if (m.keyArgumentsMade.length)
    lines.push(`**Arguments I've made:** ${m.keyArgumentsMade.join('; ')}`)
  if (Object.keys(m.opponentArguments).length) {
    const opp = Object.entries(m.opponentArguments)
      .map(([id, args]) => `  ${id}: ${args.join('; ')}`)
      .join('\n')
    lines.push(`**Opponent arguments:**\n${opp}`)
  }
  if (m.pointsNotYetAddressed.length)
    lines.push(`**Points I still need to address:** ${m.pointsNotYetAddressed.join('; ')}`)
  lines.push(`**My current state:** ${m.emotionalState} | Momentum: ${m.currentMomentum}`)
  if (m.nextTurnStrategy) lines.push(`**My strategy:** ${m.nextTurnStrategy}`)
  if (m.concessions.length)
    lines.push(`**Concessions I've made:** ${m.concessions.join('; ')}`)
  if (m.positionRefinements.length)
    lines.push(`**Position refinements:** ${m.positionRefinements.join('; ')}`)
  return lines.join('\n')
}

function buildMessages(
  recentTurns: Array<{ characterId: string | null; content: string; turnNumber: number }>,
  currentCharacterId: string,
  turnInstruction: string,
): MessageParam[] {
  const messages: MessageParam[] = []

  for (const turn of recentTurns) {
    const isMe = turn.characterId === currentCharacterId
    const role: 'user' | 'assistant' = isMe ? 'assistant' : 'user'
    const content = isMe
      ? turn.content
      : `[Turn ${turn.turnNumber}] ${turn.characterId ?? 'User'}: ${turn.content}`

    const last = messages[messages.length - 1]
    if (last && last.role === role) {
      last.content = `${last.content}\n\n${content}`
    } else {
      messages.push({ role, content })
    }
  }

  // Append the turn instruction as the final user message
  const last = messages[messages.length - 1]
  if (last?.role === 'user') {
    last.content = `${last.content}\n\n---\n${turnInstruction}`
  } else {
    messages.push({ role: 'user', content: turnInstruction })
  }

  return messages
}
