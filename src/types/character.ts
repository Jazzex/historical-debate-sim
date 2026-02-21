export interface CharacterProfile {
  id: string
  name: string
  years: string
  era: string
  avatarUrl?: string
  tags: string[]
  keyWorks: string[]
  coreBeliefs: string[]
  rhetoricalStyle: string
  knownPositions: Record<string, string>
  suggestedOpponents: string[]
  suggestedTopics: string[]
  sampleQuotes: string[]
}
