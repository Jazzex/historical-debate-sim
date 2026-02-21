export type DebateFormat = 'oxford' | 'lincoln-douglas' | 'socratic' | 'townhall'

export type TurnRole =
  | 'opening'
  | 'argument'
  | 'rebuttal'
  | 'cross-examination'
  | 'closing'

export interface DebateTurn {
  id: string
  debateId: string
  characterId: string | null
  role: TurnRole
  content: string
  turnNumber: number
  createdAt: string
}

export interface Debate {
  id: string
  title: string
  topic: string
  format: DebateFormat
  participantIds: string[]
  userParticipating: boolean
  createdAt: string
}
