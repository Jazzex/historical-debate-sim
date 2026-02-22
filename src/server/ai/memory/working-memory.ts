import type Anthropic from '@anthropic-ai/sdk'
import type { WorkingMemory } from '../../../types/memory'

interface MemoryUpdate {
  myMainThesis?: string
  newKeyArguments?: string[]
  newOpponentArguments?: Record<string, string[]>
  resolvedPoints?: string[]
  newPointsNotAddressed?: string[]
  emotionalState: string
  currentMomentum: string
  nextTurnStrategy: string
  newConcessions?: string[]
  newPositionRefinements?: string[]
}

const UPDATE_MEMORY_TOOL: Anthropic.Tool = {
  name: 'update_working_memory',
  description: "Update the debater's working memory based on the latest turn text",
  input_schema: {
    type: 'object',
    properties: {
      myMainThesis: {
        type: 'string',
        description:
          "The character's core thesis or position — update only if it has been refined or clarified in this turn",
      },
      newKeyArguments: {
        type: 'array',
        items: { type: 'string' },
        description: 'New arguments or points the character made in this turn',
      },
      newOpponentArguments: {
        type: 'object',
        description: 'New arguments made by opponents, keyed by their character ID',
        additionalProperties: { type: 'array', items: { type: 'string' } },
      },
      resolvedPoints: {
        type: 'array',
        items: { type: 'string' },
        description: 'Points from pointsNotYetAddressed that were addressed in this turn',
      },
      newPointsNotAddressed: {
        type: 'array',
        items: { type: 'string' },
        description: "New points raised by opponents that haven't been countered yet",
      },
      emotionalState: {
        type: 'string',
        description:
          "The character's current emotional tone: composed, frustrated, enthusiastic, defensive, confident, dismissive, etc.",
      },
      currentMomentum: {
        type: 'string',
        description:
          "How the debate is going from this character's perspective: winning, losing, neutral, pivoting, escalating",
      },
      nextTurnStrategy: {
        type: 'string',
        description: "The character's tactical plan for their next turn",
      },
      newConcessions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Points the character conceded to their opponents in this turn',
      },
      newPositionRefinements: {
        type: 'array',
        items: { type: 'string' },
        description: 'Ways the character has nuanced or qualified their position',
      },
    },
    required: ['emotionalState', 'currentMomentum', 'nextTurnStrategy'],
  },
}

export function initWorkingMemory(
  characterId: string,
  debateId: string,
  topic: string,
): WorkingMemory {
  return {
    characterId,
    debateId,
    myMainThesis: `To be established — topic: "${topic}"`,
    keyArgumentsMade: [],
    opponentArguments: {},
    pointsNotYetAddressed: [],
    emotionalState: 'composed',
    currentMomentum: 'neutral',
    nextTurnStrategy: 'Begin with a clear opening statement that establishes my core position.',
    concessions: [],
    positionRefinements: [],
  }
}

export async function updateWorkingMemory(
  characterId: string,
  _debateId: string,
  turnText: string,
  priorMemory: WorkingMemory,
  client: Anthropic,
): Promise<WorkingMemory> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    tool_choice: { type: 'tool', name: 'update_working_memory' },
    tools: [UPDATE_MEMORY_TOOL],
    system: `You are analyzing a debate turn from the perspective of ${characterId}. Extract structured updates to their working memory. Be precise and analytical.`,
    messages: [
      {
        role: 'user',
        content: `Prior working memory:\n${JSON.stringify(priorMemory, null, 2)}\n\nLatest turn text:\n${turnText}\n\nExtract the working memory updates.`,
      },
    ],
  })

  const toolUseBlock = response.content.find((b) => b.type === 'tool_use')
  if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
    return priorMemory
  }

  const update = toolUseBlock.input as MemoryUpdate
  const resolvedSet = new Set(update.resolvedPoints ?? [])

  const mergedOpponentArgs: Record<string, string[]> = { ...priorMemory.opponentArguments }
  for (const [charId, args] of Object.entries(update.newOpponentArguments ?? {})) {
    mergedOpponentArgs[charId] = [...(mergedOpponentArgs[charId] ?? []), ...args]
  }

  return {
    ...priorMemory,
    myMainThesis: update.myMainThesis || priorMemory.myMainThesis,
    keyArgumentsMade: [...priorMemory.keyArgumentsMade, ...(update.newKeyArguments ?? [])],
    opponentArguments: mergedOpponentArgs,
    pointsNotYetAddressed: [
      ...priorMemory.pointsNotYetAddressed.filter((p) => !resolvedSet.has(p)),
      ...(update.newPointsNotAddressed ?? []),
    ],
    emotionalState: update.emotionalState,
    currentMomentum: update.currentMomentum,
    nextTurnStrategy: update.nextTurnStrategy,
    concessions: [...priorMemory.concessions, ...(update.newConcessions ?? [])],
    positionRefinements: [
      ...priorMemory.positionRefinements,
      ...(update.newPositionRefinements ?? []),
    ],
  }
}
