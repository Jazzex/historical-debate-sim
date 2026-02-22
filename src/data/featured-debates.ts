export interface FeaturedDebate {
  id: string
  characterIds: [string, string]
  characterNames: [string, string]
  topic: string
  description: string
  format: 'oxford' | 'lincoln-douglas' | 'socratic' | 'townhall'
}

export const FEATURED_DEBATES: FeaturedDebate[] = [
  {
    id: 'nietzsche-vs-socrates',
    characterIds: ['friedrich-nietzsche', 'socrates'],
    characterNames: ['Friedrich Nietzsche', 'Socrates'],
    topic: 'Is there a morality beyond good and evil, or does virtue require a fixed standard?',
    description: 'The gadfly of Athens meets the hammer of all values. Can Socratic dialectic survive Nietzsche\'s genealogical assault?',
    format: 'socratic',
  },
  {
    id: 'darwin-vs-aquinas',
    characterIds: ['charles-darwin', 'thomas-aquinas'],
    characterNames: ['Charles Darwin', 'Thomas Aquinas'],
    topic: 'Does natural selection leave room for divine design in the origin of species?',
    description: 'The architect of evolution confronts the Angelic Doctor. Can faith and natural law accommodate a world shaped entirely by chance and time?',
    format: 'oxford',
  },
  {
    id: 'marx-vs-smith',
    characterIds: ['karl-marx', 'adam-smith'],
    characterNames: ['Karl Marx', 'Adam Smith'],
    topic: 'Does capitalism liberate human potential or produce the conditions for its own inevitable collapse?',
    description: 'Two Scotsmen — one who built the temple of markets, one who wrote its funeral oration. The defining debate of modernity.',
    format: 'lincoln-douglas',
  },
  {
    id: 'dawkins-vs-peterson',
    characterIds: ['richard-dawkins', 'jordan-peterson'],
    characterNames: ['Richard Dawkins', 'Jordan Peterson'],
    topic: 'Is religious belief a harmful delusion, or does mythology carry truths that science cannot reach?',
    description: 'The most celebrated atheist debater faces a psychologist who insists the ancient stories encode something science alone cannot see.',
    format: 'oxford',
  },
  {
    id: 'machiavelli-vs-kant',
    characterIds: ['niccolo-machiavelli', 'immanuel-kant'],
    characterNames: ['Niccolò Machiavelli', 'Immanuel Kant'],
    topic: 'Can political power ever be exercised morally, or does statecraft demand we set ethics aside?',
    description: 'The prince\'s counselor versus the philosopher of the categorical imperative. Is there a universal law, or only power dressed in its language?',
    format: 'lincoln-douglas',
  },
  {
    id: 'lincoln-vs-douglass',
    characterIds: ['abraham-lincoln', 'frederick-douglass'],
    characterNames: ['Abraham Lincoln', 'Frederick Douglass'],
    topic: 'What does America\'s founding promise of equality truly demand of those in power?',
    description: 'Two giants of American history — one who held it together, one who demanded it keep its promise. A conversation the nation never fully completed.',
    format: 'oxford',
  },
  {
    id: 'beauvoir-vs-mill',
    characterIds: ['simone-de-beauvoir', 'john-stuart-mill'],
    characterNames: ['Simone de Beauvoir', 'John Stuart Mill'],
    topic: 'Is formal liberty enough to achieve genuine freedom, or must we also confront the structures that define the Other?',
    description: 'The father of liberal feminism meets its existentialist critic. Can freedom be secured by law, or does it demand something more radical?',
    format: 'socratic',
  },
  {
    id: 'hitchens-vs-aquinas',
    characterIds: ['christopher-hitchens', 'thomas-aquinas'],
    characterNames: ['Christopher Hitchens', 'Thomas Aquinas'],
    topic: 'Is religion a force for human good, or does the evidence of history render God an unnecessary and dangerous hypothesis?',
    description: 'The most pugnacious voice of the New Atheism squares off against the greatest systematic theologian of the medieval world.',
    format: 'oxford',
  },
]
