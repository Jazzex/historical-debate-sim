import type { Debate, DebateTurn, DebateFormat, TurnRole } from '@/types/debate'
import type { CharacterProfile } from '@/types/character'

const FORMAT_LABELS: Record<DebateFormat, string> = {
  oxford: 'Oxford',
  'lincoln-douglas': 'Lincoln-Douglas',
  socratic: 'Socratic',
  townhall: 'Town Hall',
}

const ROLE_LABELS: Record<TurnRole, string> = {
  opening: 'Opening Statement',
  argument: 'Argument',
  rebuttal: 'Rebuttal',
  'cross-examination': 'Cross-Examination',
  closing: 'Closing Statement',
}

/**
 * Pure function: generates a Markdown transcript of a debate.
 * Does not trigger any side effects (no download, no DOM).
 */
export function exportDebateMarkdown(
  debate: Debate,
  turns: DebateTurn[],
  characters: Map<string, CharacterProfile>,
): string {
  const format = debate.format as DebateFormat
  const lines = [
    `# ${debate.title}`,
    ``,
    `**Topic:** ${debate.topic}`,
    `**Format:** ${FORMAT_LABELS[format] ?? format}`,
    `**Date:** ${new Date(debate.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    ``,
    `---`,
    ``,
    ...turns.map((turn) => {
      const char = characters.get(turn.characterId ?? '')
      const name = char?.name ?? (turn.characterId ? turn.characterId : 'You')
      const role = ROLE_LABELS[turn.role as TurnRole] ?? turn.role
      return `## ${name} — ${role}\n\n${turn.content}\n`
    }),
  ]
  return lines.join('\n')
}

/**
 * Triggers a browser download for the given Markdown string.
 */
export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
