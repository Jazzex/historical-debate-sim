import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { CharacterProfile } from '../types/character'

const CHARACTERS_DIR = join(import.meta.dirname, 'characters')
const REQUIRED_FIELDS: (keyof CharacterProfile)[] = [
  'id',
  'name',
  'years',
  'era',
  'tags',
  'keyWorks',
  'coreBeliefs',
  'rhetoricalStyle',
  'knownPositions',
  'suggestedOpponents',
  'suggestedTopics',
  'sampleQuotes',
]

const EXPECTED_IDS = [
  'socrates', 'plato', 'aristotle', 'immanuel-kant', 'friedrich-nietzsche',
  'john-stuart-mill', 'simone-de-beauvoir', 'confucius', 'thomas-aquinas',
  'martin-luther', 'augustine-of-hippo', 'maimonides', 'ibn-rushd',
  'charles-darwin', 'marie-curie', 'galileo-galilei', 'nikola-tesla',
  'richard-dawkins', 'christopher-hitchens', 'noam-chomsky', 'sam-harris',
  'jordan-peterson', 'karl-marx', 'adam-smith', 'abraham-lincoln',
  'frederick-douglass', 'niccolo-machiavelli', 'thomas-jefferson',
  'edmund-burke', 'milton-friedman', 'oscar-wilde', 'george-orwell',
  'virginia-woolf', 'leo-tolstoy',
]

function loadAll(): CharacterProfile[] {
  return readdirSync(CHARACTERS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(readFileSync(join(CHARACTERS_DIR, f), 'utf-8')) as CharacterProfile)
}

describe('Character JSON profiles', () => {
  const chars = loadAll()

  it('has exactly 34 characters', () => {
    expect(chars).toHaveLength(34)
  })

  it('contains all expected character IDs', () => {
    const ids = chars.map((c) => c.id).sort()
    expect(ids).toEqual([...EXPECTED_IDS].sort())
  })

  it.each(chars.map((c) => [c.id, c] as [string, CharacterProfile]))(
    '%s has all required fields',
    (_id, char) => {
      for (const field of REQUIRED_FIELDS) {
        expect(char[field], `${field} should be defined`).toBeDefined()
      }
    },
  )

  it.each(chars.map((c) => [c.id, c] as [string, CharacterProfile]))(
    '%s id matches filename convention',
    (id, char) => {
      expect(char.id).toBe(id)
    },
  )

  it.each(chars.map((c) => [c.id, c] as [string, CharacterProfile]))(
    '%s has non-empty arrays',
    (_id, char) => {
      expect(char.tags.length).toBeGreaterThan(0)
      expect(char.keyWorks.length).toBeGreaterThan(0)
      expect(char.coreBeliefs.length).toBeGreaterThan(0)
      expect(char.suggestedOpponents.length).toBeGreaterThan(0)
      expect(char.suggestedTopics.length).toBeGreaterThan(0)
      expect(char.sampleQuotes.length).toBeGreaterThan(0)
    },
  )
})
