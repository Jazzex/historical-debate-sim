import { describe, expect, it } from 'vitest'
import { getNextTurnInfo, EPISODIC_COMPRESSION_THRESHOLD } from './debate-engine'

describe('getNextTurnInfo', () => {
  describe('oxford format with 2 participants', () => {
    const participants = ['socrates', 'nietzsche']

    it('turn 0: first participant opening', () => {
      const next = getNextTurnInfo('oxford', participants, 0)
      expect(next).toEqual({ characterId: 'socrates', role: 'opening', turnNumber: 1 })
    })

    it('turn 1: second participant opening', () => {
      const next = getNextTurnInfo('oxford', participants, 1)
      expect(next).toEqual({ characterId: 'nietzsche', role: 'opening', turnNumber: 2 })
    })

    it('turn 2: first participant argument', () => {
      const next = getNextTurnInfo('oxford', participants, 2)
      expect(next).toEqual({ characterId: 'socrates', role: 'argument', turnNumber: 3 })
    })

    it('turn 3: second participant argument', () => {
      const next = getNextTurnInfo('oxford', participants, 3)
      expect(next).toEqual({ characterId: 'nietzsche', role: 'argument', turnNumber: 4 })
    })

    it('final turn: second participant closing', () => {
      // oxford has 4 phases × 2 participants = 8 turns (0–7)
      const next = getNextTurnInfo('oxford', participants, 7)
      expect(next).toEqual({ characterId: 'nietzsche', role: 'closing', turnNumber: 8 })
    })

    it('returns null when debate is complete', () => {
      const next = getNextTurnInfo('oxford', participants, 8)
      expect(next).toBeNull()
    })
  })

  describe('with 3 participants', () => {
    const participants = ['kant', 'mill', 'nietzsche']

    it('turn 0: first participant opening', () => {
      const next = getNextTurnInfo('oxford', participants, 0)
      expect(next?.characterId).toBe('kant')
      expect(next?.role).toBe('opening')
    })

    it('turn 2: third participant opening', () => {
      const next = getNextTurnInfo('oxford', participants, 2)
      expect(next?.characterId).toBe('nietzsche')
      expect(next?.role).toBe('opening')
    })

    it('turn 3: first participant argument', () => {
      const next = getNextTurnInfo('oxford', participants, 3)
      expect(next?.characterId).toBe('kant')
      expect(next?.role).toBe('argument')
    })
  })

  describe('socratic format', () => {
    const participants = ['socrates', 'thrasymachus']

    it('includes cross-examination turns', () => {
      const turn2 = getNextTurnInfo('socratic', participants, 2)
      expect(turn2?.role).toBe('cross-examination')
    })
  })
})

describe('EPISODIC_COMPRESSION_THRESHOLD', () => {
  it('is a positive number', () => {
    expect(EPISODIC_COMPRESSION_THRESHOLD).toBeGreaterThan(0)
  })
})
