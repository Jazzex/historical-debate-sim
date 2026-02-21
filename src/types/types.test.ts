import { describe, expectTypeOf, it } from 'vitest'
import type { CharacterProfile } from './character'
import type { WorkingMemory } from './memory'
import type { Debate, DebateFormat, DebateTurn, TurnRole } from './debate'

describe('CharacterProfile', () => {
  it('has correct shape', () => {
    const profile: CharacterProfile = {
      id: 'socrates',
      name: 'Socrates',
      years: '470–399 BC',
      era: 'Ancient Greece',
      tags: ['philosophy', 'ethics'],
      keyWorks: ['Apology', 'Phaedo'],
      coreBeliefs: ['virtue is knowledge'],
      rhetoricalStyle: 'Socratic method',
      knownPositions: { ethics: 'virtue is knowledge' },
      suggestedOpponents: ['plato'],
      suggestedTopics: ['the nature of justice'],
      sampleQuotes: ['I know that I know nothing'],
    }
    expectTypeOf(profile).toMatchTypeOf<CharacterProfile>()
    expectTypeOf(profile.avatarUrl).toMatchTypeOf<string | undefined>()
  })
})

describe('WorkingMemory', () => {
  it('has correct shape', () => {
    const mem: WorkingMemory = {
      characterId: 'socrates',
      debateId: 'debate-1',
      myMainThesis: 'Virtue is knowledge',
      keyArgumentsMade: ['ignorance causes wrongdoing'],
      opponentArguments: { 'debate-1': ['might makes right'] },
      pointsNotYetAddressed: ['the afterlife'],
      emotionalState: 'curious',
      currentMomentum: 'gaining ground',
      nextTurnStrategy: 'ask a clarifying question',
      concessions: [],
      positionRefinements: [],
    }
    expectTypeOf(mem).toMatchTypeOf<WorkingMemory>()
  })
})

describe('DebateFormat', () => {
  it('allows valid formats', () => {
    const formats: DebateFormat[] = ['oxford', 'lincoln-douglas', 'socratic', 'townhall']
    expectTypeOf(formats[0]).toMatchTypeOf<DebateFormat>()
  })
})

describe('TurnRole', () => {
  it('allows valid roles', () => {
    const roles: TurnRole[] = ['opening', 'argument', 'rebuttal', 'cross-examination', 'closing']
    expectTypeOf(roles[0]).toMatchTypeOf<TurnRole>()
  })
})

describe('DebateTurn', () => {
  it('has correct shape', () => {
    const turn: DebateTurn = {
      id: 'turn-1',
      debateId: 'debate-1',
      characterId: 'socrates',
      role: 'opening',
      content: 'Let us examine this together.',
      turnNumber: 1,
      createdAt: '2026-01-01T00:00:00Z',
    }
    expectTypeOf(turn.characterId).toMatchTypeOf<string | null>()
  })
})

describe('Debate', () => {
  it('has correct shape', () => {
    const debate: Debate = {
      id: 'debate-1',
      title: 'Socrates vs Nietzsche',
      topic: 'The nature of morality',
      format: 'oxford',
      participantIds: ['socrates', 'nietzsche'],
      userParticipating: false,
      createdAt: '2026-01-01T00:00:00Z',
    }
    expectTypeOf(debate.format).toMatchTypeOf<DebateFormat>()
  })
})
