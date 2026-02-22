import { eq, and, isNotNull } from 'drizzle-orm'
import type { DbClient } from '../db'
import type { DebateFormat, TurnRole } from '../../types/debate'
import { debates, debateTurns } from '../db/schema'
import { getTurnSequence } from '../../lib/debate-formats'

export const EPISODIC_COMPRESSION_THRESHOLD = 4

/**
 * Pure function: given a format, participant list, and number of completed turns,
 * returns the next turn's character, role, and turn number — or null if the debate is done.
 *
 * Turn scheduling: participants rotate through each phase in order.
 * For Oxford with [A, B]: A-opening → B-opening → A-argument → B-argument → ...
 */
export function getNextTurnInfo(
  format: DebateFormat,
  participantIds: string[],
  completedTurns: number,
): { characterId: string; role: TurnRole; turnNumber: number } | null {
  const phases = getTurnSequence(format)
  const n = participantIds.length

  const participantIndex = completedTurns % n
  const phaseIndex = Math.floor(completedTurns / n)

  if (phaseIndex >= phases.length) return null

  return {
    characterId: participantIds[participantIndex],
    role: phases[phaseIndex],
    turnNumber: completedTurns + 1,
  }
}

/**
 * DB-backed version: loads debate + turn count, returns next turn info.
 */
export async function getNextTurn(
  db: DbClient,
  debateId: string,
): Promise<{ characterId: string; role: TurnRole; turnNumber: number } | null> {
  const debateRows = await db.select().from(debates).where(eq(debates.id, debateId))
  const debate = debateRows[0]
  if (!debate) return null

  // Only count AI turns (characterId IS NOT NULL) — user turns don't advance the AI schedule
  const turns = await db
    .select({ id: debateTurns.id })
    .from(debateTurns)
    .where(and(eq(debateTurns.debateId, debateId), isNotNull(debateTurns.characterId)))

  return getNextTurnInfo(debate.format as DebateFormat, debate.participantIds, turns.length)
}

/**
 * Returns true when a character has made enough turns that older turns should be
 * compressed into their episodic summary.
 */
export async function shouldCompressEpisodic(
  db: DbClient,
  debateId: string,
  characterId: string,
): Promise<boolean> {
  const turns = await db
    .select({ id: debateTurns.id })
    .from(debateTurns)
    .where(
      and(eq(debateTurns.debateId, debateId), eq(debateTurns.characterId, characterId)),
    )

  return turns.length > EPISODIC_COMPRESSION_THRESHOLD
}
