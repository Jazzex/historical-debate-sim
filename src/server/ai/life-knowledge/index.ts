type LifeKnowledgeLoader = () => Promise<{ lifeKnowledge: string }>

const loaders: Record<string, LifeKnowledgeLoader> = {
  'abraham-lincoln': () => import('./abraham-lincoln'),
  'adam-smith': () => import('./adam-smith'),
  'aristotle': () => import('./aristotle'),
  'augustine-of-hippo': () => import('./augustine-of-hippo'),
  'charles-darwin': () => import('./charles-darwin'),
  'christopher-hitchens': () => import('./christopher-hitchens'),
  'confucius': () => import('./confucius'),
  'edmund-burke': () => import('./edmund-burke'),
  'frederick-douglass': () => import('./frederick-douglass'),
  'friedrich-nietzsche': () => import('./friedrich-nietzsche'),
  'galileo-galilei': () => import('./galileo-galilei'),
  'george-orwell': () => import('./george-orwell'),
  'ibn-rushd': () => import('./ibn-rushd'),
  'immanuel-kant': () => import('./immanuel-kant'),
  'john-stuart-mill': () => import('./john-stuart-mill'),
  'jordan-peterson': () => import('./jordan-peterson'),
  'karl-marx': () => import('./karl-marx'),
  'leo-tolstoy': () => import('./leo-tolstoy'),
  'maimonides': () => import('./maimonides'),
  'marie-curie': () => import('./marie-curie'),
  'martin-luther': () => import('./martin-luther'),
  'milton-friedman': () => import('./milton-friedman'),
  'niccolo-machiavelli': () => import('./niccolo-machiavelli'),
  'nikola-tesla': () => import('./nikola-tesla'),
  'noam-chomsky': () => import('./noam-chomsky'),
  'oscar-wilde': () => import('./oscar-wilde'),
  'plato': () => import('./plato'),
  'richard-dawkins': () => import('./richard-dawkins'),
  'sam-harris': () => import('./sam-harris'),
  'simone-de-beauvoir': () => import('./simone-de-beauvoir'),
  'socrates': () => import('./socrates'),
  'thomas-aquinas': () => import('./thomas-aquinas'),
  'thomas-jefferson': () => import('./thomas-jefferson'),
  'virginia-woolf': () => import('./virginia-woolf'),
}

export async function getLifeKnowledge(characterId: string): Promise<string> {
  const load = loaders[characterId]
  if (!load) throw new Error(`No life knowledge found for character: ${characterId}`)
  const mod = await load()
  return mod.lifeKnowledge
}

export const knownCharacterIds = Object.keys(loaders)
