/**
 * Seed script — reads all JSON files from src/data/characters/ and inserts into D1.
 * Run via wrangler: bunx wrangler d1 execute historical-debate-sim --local --file=drizzle/seed.sql
 * Or generate SQL: bun run seed:sql
 *
 * For local dev with wrangler: bun run seed
 */
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { CharacterProfile } from '../../types/character'

async function generateSeedSQL(): Promise<string> {
  const dir = join(import.meta.dirname, '../../data/characters')
  const files = (await readdir(dir)).filter((f) => f.endsWith('.json'))

  const rows: string[] = []
  for (const file of files) {
    const raw = await readFile(join(dir, file), 'utf-8')
    const char: CharacterProfile = JSON.parse(raw)

    const escape = (s: string) => s.replace(/'/g, "''")
    const jsonEsc = (v: unknown) => escape(JSON.stringify(v))

    rows.push(
      `INSERT OR REPLACE INTO characters (id, name, years, era, avatar_url, tags, key_works, core_beliefs, rhetorical_style, known_positions, suggested_opponents, suggested_topics, sample_quotes) VALUES (` +
        `'${escape(char.id)}',` +
        `'${escape(char.name)}',` +
        `'${escape(char.years)}',` +
        `'${escape(char.era)}',` +
        `${char.avatarUrl ? `'${escape(char.avatarUrl)}'` : 'NULL'},` +
        `'${jsonEsc(char.tags)}',` +
        `'${jsonEsc(char.keyWorks)}',` +
        `'${jsonEsc(char.coreBeliefs)}',` +
        `'${escape(char.rhetoricalStyle)}',` +
        `'${jsonEsc(char.knownPositions)}',` +
        `'${jsonEsc(char.suggestedOpponents)}',` +
        `'${jsonEsc(char.suggestedTopics)}',` +
        `'${jsonEsc(char.sampleQuotes)}');`,
    )
  }

  return rows.join('\n')
}

const sql = await generateSeedSQL()
process.stdout.write(sql + '\n')
