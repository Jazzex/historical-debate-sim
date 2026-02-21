import { describe, expect, it } from 'vitest'
import { getTurnSequence, getTurnInstruction, isUserTurn } from './debate-formats'
import type { DebateFormat, TurnRole } from '../types/debate'

const FORMATS: DebateFormat[] = ['oxford', 'lincoln-douglas', 'socratic', 'townhall']

describe('getTurnSequence', () => {
  it('returns a non-empty array for every format', () => {
    for (const format of FORMATS) {
      expect(getTurnSequence(format).length).toBeGreaterThan(0)
    }
  })

  it('oxford sequence is [opening, argument, rebuttal, closing]', () => {
    expect(getTurnSequence('oxford')).toEqual(['opening', 'argument', 'rebuttal', 'closing'])
  })

  it('lincoln-douglas sequence includes cross-examination', () => {
    expect(getTurnSequence('lincoln-douglas')).toContain('cross-examination')
  })

  it('socratic sequence includes multiple cross-examination turns', () => {
    const seq = getTurnSequence('socratic')
    expect(seq.filter((r) => r === 'cross-examination').length).toBeGreaterThan(1)
  })

  it('townhall sequence includes multiple argument turns', () => {
    const seq = getTurnSequence('townhall')
    expect(seq.filter((r) => r === 'argument').length).toBeGreaterThan(1)
  })

  it('every sequence starts with opening and ends with closing', () => {
    for (const format of FORMATS) {
      const seq = getTurnSequence(format)
      expect(seq[0]).toBe('opening')
      expect(seq[seq.length - 1]).toBe('closing')
    }
  })
})

describe('getTurnInstruction', () => {
  const roles: TurnRole[] = ['opening', 'argument', 'rebuttal', 'cross-examination', 'closing']

  it.each(FORMATS)('returns a non-empty string for all roles in %s format', (format) => {
    for (const role of roles) {
      const instruction = getTurnInstruction(format, role, 1, 'Socrates', ['Nietzsche'])
      expect(instruction).toBeTruthy()
      expect(typeof instruction).toBe('string')
    }
  })

  it('includes the speaker name in the instruction', () => {
    const instruction = getTurnInstruction('oxford', 'opening', 1, 'Aristotle', ['Plato'])
    expect(instruction).toContain('Aristotle')
  })

  it('includes opponent names for rebuttal', () => {
    const instruction = getTurnInstruction('oxford', 'rebuttal', 3, 'Kant', ['Nietzsche'])
    expect(instruction).toContain('Nietzsche')
  })

  it('includes opponent names for cross-examination', () => {
    const instruction = getTurnInstruction(
      'lincoln-douglas',
      'cross-examination',
      2,
      'Socrates',
      ['Thrasymachus'],
    )
    expect(instruction).toContain('Thrasymachus')
  })
})

describe('isUserTurn', () => {
  it.each(FORMATS)('always returns false for %s format', (format) => {
    const roles: TurnRole[] = ['opening', 'argument', 'rebuttal', 'cross-examination', 'closing']
    for (const role of roles) {
      expect(isUserTurn(format, role)).toBe(false)
    }
  })
})
