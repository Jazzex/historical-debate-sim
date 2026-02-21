/**
 * Manual integration test for the working memory update pipeline.
 * Requires ANTHROPIC_API_KEY in .env.local.
 *
 * Run: ~/.bun/bin/bun run scripts/test-memory.ts
 */
import { initWorkingMemory, updateWorkingMemory } from '../src/server/ai/memory/working-memory'

const characterId = 'socrates'
const debateId = 'test-debate-001'
const topic = 'Is justice better than injustice?'

console.log('=== Working Memory Integration Test ===\n')

const initial = initWorkingMemory(characterId, debateId, topic)
console.log('Initial memory:')
console.log(JSON.stringify(initial, null, 2))

const turnText = `
I have listened carefully to your arguments, Thrasymachus, and I find them most revealing.
You claim that justice is merely the advantage of the stronger — that rulers define what is just
for their own benefit. But consider: do rulers not sometimes make mistakes about what benefits
them? If a ruler wrongly calculates his interests and legislates accordingly, must the subjects
obey that mistaken law? If so, your definition collapses — for the just would be following
what is not, in fact, to the advantage of the stronger.

Furthermore, I would argue that injustice corrupts the soul. It creates internal discord, just as
disease corrupts the body. The just person, by contrast, has a soul in harmony — and harmony
produces strength, while discord produces weakness. Therefore, the just person lives better and
is happier than the unjust. Your position, Thrasymachus, proves its own undoing.
`.trim()

console.log('\nTurn text (simulated):')
console.log(turnText)
console.log('\nCalling updateWorkingMemory with claude-haiku-4-5-20251001...\n')

const updated = await updateWorkingMemory(characterId, debateId, turnText, initial)

console.log('Updated memory:')
console.log(JSON.stringify(updated, null, 2))

console.log('\n=== Test complete ===')
