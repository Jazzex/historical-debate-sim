import { sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const characters = sqliteTable('characters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  years: text('years').notNull(),
  era: text('era').notNull(),
  avatarUrl: text('avatar_url'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull(),
  keyWorks: text('key_works', { mode: 'json' }).$type<string[]>().notNull(),
  coreBeliefs: text('core_beliefs', { mode: 'json' }).$type<string[]>().notNull(),
  rhetoricalStyle: text('rhetorical_style').notNull(),
  knownPositions: text('known_positions', { mode: 'json' })
    .$type<Record<string, string>>()
    .notNull(),
  suggestedOpponents: text('suggested_opponents', { mode: 'json' })
    .$type<string[]>()
    .notNull(),
  suggestedTopics: text('suggested_topics', { mode: 'json' })
    .$type<string[]>()
    .notNull(),
  sampleQuotes: text('sample_quotes', { mode: 'json' }).$type<string[]>().notNull(),
})

export const debates = sqliteTable('debates', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  topic: text('topic').notNull(),
  format: text('format').notNull(),
  participantIds: text('participant_ids', { mode: 'json' }).$type<string[]>().notNull(),
  userParticipating: integer('user_participating', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const debateTurns = sqliteTable('debate_turns', {
  id: text('id').primaryKey(),
  debateId: text('debate_id')
    .notNull()
    .references(() => debates.id),
  characterId: text('character_id'),
  role: text('role').notNull(),
  content: text('content').notNull(),
  turnNumber: integer('turn_number').notNull(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})

export const characterMemory = sqliteTable('character_memory', {
  id: text('id').primaryKey(),
  characterId: text('character_id').notNull(),
  debateId: text('debate_id')
    .notNull()
    .references(() => debates.id),
  workingMemory: text('working_memory', { mode: 'json' })
    .$type<Record<string, unknown>>()
    .notNull(),
  episodicSummary: text('episodic_summary').notNull().default(''),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
})
