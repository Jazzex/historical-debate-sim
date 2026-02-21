import { describe, expect, it } from 'vitest'
import { initWorkingMemory } from './working-memory'

describe('initWorkingMemory', () => {
  const mem = initWorkingMemory('socrates', 'debate-001', 'Is justice better than injustice?')

  it('sets characterId correctly', () => {
    expect(mem.characterId).toBe('socrates')
  })

  it('sets debateId correctly', () => {
    expect(mem.debateId).toBe('debate-001')
  })

  it('includes the topic in myMainThesis', () => {
    expect(mem.myMainThesis).toContain('Is justice better than injustice?')
  })

  it('initializes all arrays as empty', () => {
    expect(mem.keyArgumentsMade).toEqual([])
    expect(mem.pointsNotYetAddressed).toEqual([])
    expect(mem.concessions).toEqual([])
    expect(mem.positionRefinements).toEqual([])
  })

  it('initializes opponentArguments as empty object', () => {
    expect(mem.opponentArguments).toEqual({})
  })

  it('sets a neutral initial emotional state', () => {
    expect(mem.emotionalState).toBeTruthy()
    expect(mem.currentMomentum).toBeTruthy()
  })

  it('sets an initial strategy', () => {
    expect(mem.nextTurnStrategy).toBeTruthy()
  })

  it('produces distinct instances for different calls', () => {
    const mem2 = initWorkingMemory('plato', 'debate-002', 'The nature of beauty')
    expect(mem2.characterId).toBe('plato')
    expect(mem2.myMainThesis).toContain('The nature of beauty')
    // Mutating one should not affect the other
    mem2.keyArgumentsMade.push('test')
    expect(mem.keyArgumentsMade).toHaveLength(0)
  })
})
