import type Anthropic from '@anthropic-ai/sdk'
import type { DebateTurn } from '../../../types/debate'

export async function compressEpisodicMemory(
  characterId: string,
  turnsToCompress: DebateTurn[],
  existingSummary: string,
  client: Anthropic,
): Promise<string> {
  if (turnsToCompress.length === 0) return existingSummary

  const turnsText = turnsToCompress
    .map((t) => `[Turn ${t.turnNumber}] ${t.characterId ?? 'User'}: ${t.content}`)
    .join('\n\n')

  const contextParts = [
    existingSummary ? `Existing summary:\n${existingSummary}\n\n` : '',
    `Turns to incorporate:\n${turnsText}\n\nWrite an updated first-person summary.`,
  ]

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    system: `You are writing a compressed memory summary from the perspective of ${characterId}. Write in first person as that historical figure would remember the debate so far. Focus on key arguments, emotional dynamics, and strategic observations. Be concise — 2–4 sentences.`,
    messages: [
      {
        role: 'user',
        content: contextParts.filter(Boolean).join(''),
      },
    ],
  })

  const textBlock = response.content.find((b) => b.type === 'text')
  return textBlock?.type === 'text' ? textBlock.text : existingSummary
}
