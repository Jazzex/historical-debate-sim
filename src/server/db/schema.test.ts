import { describe, expect, it } from 'vitest'
import { characters, debates, debateTurns, characterMemory } from './schema'

describe('DB Schema', () => {
  it('characters table has required columns', () => {
    const cols = Object.keys(characters)
    expect(cols).toContain('id')
    expect(cols).toContain('name')
    expect(cols).toContain('era')
    expect(cols).toContain('tags')
    expect(cols).toContain('keyWorks')
  })

  it('debates table has required columns', () => {
    const cols = Object.keys(debates)
    expect(cols).toContain('id')
    expect(cols).toContain('topic')
    expect(cols).toContain('format')
    expect(cols).toContain('participantIds')
  })

  it('debate_turns table has required columns', () => {
    const cols = Object.keys(debateTurns)
    expect(cols).toContain('id')
    expect(cols).toContain('debateId')
    expect(cols).toContain('role')
    expect(cols).toContain('content')
    expect(cols).toContain('turnNumber')
  })

  it('character_memory table has required columns', () => {
    const cols = Object.keys(characterMemory)
    expect(cols).toContain('id')
    expect(cols).toContain('characterId')
    expect(cols).toContain('debateId')
    expect(cols).toContain('workingMemory')
    expect(cols).toContain('episodicSummary')
  })
})
