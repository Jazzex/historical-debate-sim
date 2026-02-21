export interface WorkingMemory {
  characterId: string
  debateId: string
  myMainThesis: string
  keyArgumentsMade: string[]
  opponentArguments: Record<string, string[]>
  pointsNotYetAddressed: string[]
  emotionalState: string
  currentMomentum: string
  nextTurnStrategy: string
  concessions: string[]
  positionRefinements: string[]
}
