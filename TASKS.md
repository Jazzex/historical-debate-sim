# Tasks — Historical Debate Simulator

Tasks are organized by milestone. Complete milestones in order — each builds on the previous.
Status: `[ ]` pending · `[x]` done · `[-]` blocked · `[~]` in progress

> **Implementation notes** — deviations from the original plan are marked with ⚠️

---

## Milestone 1 — Project Scaffolding ✅

- [x] **M1-01** Initialize TanStack Start project with Bun ⚠️ *Used `bunx @tanstack/cli@latest create` (create-tsrouter-app is deprecated)*
- [x] **M1-02** Enable TypeScript strict mode in `tsconfig.json` *(already enabled by default)*
- [x] **M1-03** Initialize shadcn/ui with neutral base color, CSS variables enabled
- [x] **M1-04** Install shadcn components: `button card dialog badge avatar select scroll-area separator sheet skeleton sonner tabs radio-group textarea input` ⚠️ *Used `sonner` instead of deprecated `toast`*
- [x] **M1-05** Install core dependencies: `@anthropic-ai/sdk drizzle-orm hono` ⚠️ *Replaced `better-sqlite3` with Cloudflare D1 (not supported in Workers runtime)*
- [x] **M1-06** Install dev dependencies: `drizzle-kit wrangler @cloudflare/workers-types` ⚠️ *Added wrangler + CF types instead of `@types/better-sqlite3`*
- [x] **M1-07** Create `.env.local` with `ANTHROPIC_API_KEY` + Cloudflare credential placeholders; `*.local` already in `.gitignore`
- [x] **M1-08** Create `src/server/db/schema.ts` with four tables: `characters`, `debates`, `debate_turns`, `character_memory`
- [x] **M1-09** Create `src/server/db/index.ts` — `getDb(d1: D1Database)` factory using `drizzle-orm/d1` ⚠️ *D1 adapter, not better-sqlite3*
- [x] **M1-10** Run `bunx drizzle-kit generate` to create SQL migrations (`drizzle/`)
- [x] **M1-11** Verify all four tables exist in generated migration SQL
- [x] **M1-12** Create Hono app instance `src/server/api/index.ts` with `HonoContext` typed for CF bindings (`DB`, `ANTHROPIC_API_KEY`)

---

## Milestone 2 — TypeScript Interfaces & Types ✅

- [x] **M2-01** `CharacterProfile` interface — `src/types/character.ts`
- [x] **M2-02** `WorkingMemory` interface — `src/types/memory.ts`
- [x] **M2-03** `DebateFormat` type — `src/types/debate.ts`
- [x] **M2-04** `TurnRole` type — `src/types/debate.ts`
- [x] **M2-05** `DebateTurn` interface — `src/types/debate.ts`
- [x] **M2-06** `Debate` interface — `src/types/debate.ts`

---

## Milestone 3 — Character Data ✅

### JSON Profiles

- [x] **M3-01** `socrates.json`
- [x] **M3-02** `plato.json`
- [x] **M3-03** `aristotle.json`
- [x] **M3-04** `immanuel-kant.json`
- [x] **M3-05** `friedrich-nietzsche.json`
- [x] **M3-06** `john-stuart-mill.json`
- [x] **M3-07** `simone-de-beauvoir.json`
- [x] **M3-08** `confucius.json`
- [x] **M3-09** `thomas-aquinas.json`
- [x] **M3-10** `martin-luther.json`
- [x] **M3-11** `augustine-of-hippo.json`
- [x] **M3-12** `maimonides.json`
- [x] **M3-13** `ibn-rushd.json`
- [x] **M3-14** `charles-darwin.json`
- [x] **M3-15** `marie-curie.json`
- [x] **M3-16** `galileo-galilei.json`
- [x] **M3-17** `nikola-tesla.json`
- [x] **M3-18** `richard-dawkins.json`
- [x] **M3-19** `christopher-hitchens.json`
- [x] **M3-20** `noam-chomsky.json`
- [x] **M3-21** `sam-harris.json`
- [x] **M3-22** `jordan-peterson.json`
- [x] **M3-23** `karl-marx.json`
- [x] **M3-24** `adam-smith.json`
- [x] **M3-25** `abraham-lincoln.json`
- [x] **M3-26** `frederick-douglass.json`
- [x] **M3-27** `niccolo-machiavelli.json`
- [x] **M3-28** `thomas-jefferson.json`
- [x] **M3-29** `edmund-burke.json`
- [x] **M3-30** `milton-friedman.json`
- [x] **M3-31** `oscar-wilde.json`
- [x] **M3-32** `george-orwell.json`
- [x] **M3-33** `virginia-woolf.json`
- [x] **M3-34** `leo-tolstoy.json`

### Life Knowledge Prompts

- [x] **M3-35** `socrates.ts`
- [x] **M3-36** `plato.ts`
- [x] **M3-37** `aristotle.ts`
- [x] **M3-38** `immanuel-kant.ts`
- [x] **M3-39** `friedrich-nietzsche.ts`
- [x] **M3-40** `john-stuart-mill.ts`
- [x] **M3-41** `simone-de-beauvoir.ts`
- [x] **M3-42** `confucius.ts`
- [x] **M3-43** `thomas-aquinas.ts`
- [x] **M3-44** `martin-luther.ts`
- [x] **M3-45** `augustine-of-hippo.ts`
- [x] **M3-46** `maimonides.ts`
- [x] **M3-47** `ibn-rushd.ts`
- [x] **M3-48** `charles-darwin.ts`
- [x] **M3-49** `marie-curie.ts`
- [x] **M3-50** `galileo-galilei.ts`
- [x] **M3-51** `nikola-tesla.ts`
- [x] **M3-52** `richard-dawkins.ts`
- [x] **M3-53** `christopher-hitchens.ts`
- [x] **M3-54** `noam-chomsky.ts`
- [x] **M3-55** `sam-harris.ts`
- [x] **M3-56** `jordan-peterson.ts`
- [x] **M3-57** `karl-marx.ts`
- [x] **M3-58** `adam-smith.ts`
- [x] **M3-59** `abraham-lincoln.ts`
- [x] **M3-60** `frederick-douglass.ts`
- [x] **M3-61** `niccolo-machiavelli.ts`
- [x] **M3-62** `thomas-jefferson.ts`
- [x] **M3-63** `edmund-burke.ts`
- [x] **M3-64** `milton-friedman.ts`
- [x] **M3-65** `oscar-wilde.ts`
- [x] **M3-66** `george-orwell.ts`
- [x] **M3-67** `virginia-woolf.ts`
- [x] **M3-68** `leo-tolstoy.ts`

### DB Seed

- [x] **M3-69** `src/server/db/seed.ts` — generates `drizzle/seed.sql` (34 INSERT statements)
- [x] **M3-70** `seed:sql` and `seed` scripts added to `package.json`
- [ ] **M3-71** Run seed against D1 and verify all 34 characters *(requires wrangler + D1 configured — see `CLOUDFLARE_DEPLOY.md`)*

---

## Milestone 4 — AI Memory Engine ✅

- [x] **M4-01** Create `src/server/ai/client.ts` — initialize Anthropic SDK from `ANTHROPIC_API_KEY` env var, export `anthropic`
- [x] **M4-02** Create `src/server/ai/life-knowledge/index.ts` — dynamic import map from characterId → life knowledge string
- [x] **M4-03** Create `src/server/ai/memory/working-memory.ts`:
  - `initWorkingMemory(characterId, debateId, topic): WorkingMemory` — returns blank working memory
  - `updateWorkingMemory(characterId, debateId, turnText, priorMemory): Promise<WorkingMemory>` — calls `claude-haiku-4-5-20251001` with `tool_use` to extract structured update, merges with prior state
- [x] **M4-04** Create `src/server/ai/memory/episodic-compress.ts`:
  - `compressEpisodicMemory(characterId, turnsToCompress, existingSummary): Promise<string>` — calls `claude-haiku-4-5-20251001` to generate character-perspective narrative summary of old turns ⚠️ *Removed unused `debateId` param*
- [x] **M4-05** Create `src/server/ai/memory/context-assembly.ts`:
  - `assembleCharacterContext(db, characterId, debateId, topic, format, turnInstruction): Promise<{system: string, messages: MessageParam[]}>` — loads life knowledge, working memory, episodic summary from DB, recent turns from DB, assembles full context object ⚠️ *Added `db: DbClient` first param (required for CF Workers — DB comes from bindings)*
- [x] **M4-06** Create `src/lib/debate-formats.ts` — define format rules for Oxford, Lincoln-Douglas, Socratic, Town Hall:
  - `getTurnSequence(format): TurnRole[]`
  - `getTurnInstruction(format, role, turnNumber, speakerName, opponentNames): string`
  - `isUserTurn(format, role): boolean`
- [x] **M4-07** Create `src/server/ai/debate-engine.ts`:
  - `getNextTurnInfo(format, participantIds, completedTurns)` — pure turn-scheduling function (used directly in tests)
  - `getNextTurn(db, debateId): { characterId, role, turnNumber } | null` — DB-backed version ⚠️ *Added `db: DbClient` first param*
  - `shouldCompressEpisodic(db, debateId, characterId): Promise<boolean>` — checks if turn count crosses threshold ⚠️ *Added `db: DbClient` first param; returns Promise*
- [x] **M4-08** Write manual test script `scripts/test-memory.ts` — creates fake working memory, calls `updateWorkingMemory`, logs result *(run with `~/.bun/bin/bun run scripts/test-memory.ts`; requires `ANTHROPIC_API_KEY`)*

---

## Milestone 5 — Debate API (SSE Endpoint)

- [ ] **M5-01** Create Hono route `GET /api/debate/turn`:
  - Validate `debateId` and `characterId` query params
  - Call `assembleCharacterContext`
  - Open Anthropic streaming request with `claude-sonnet-4-6`, max 1024 tokens
  - Return SSE response: stream `{ delta: string }` events, end with `[DONE]`
- [ ] **M5-02** After stream completes (background async): call `updateWorkingMemory`, save to `character_memory` table
- [ ] **M5-03** After stream completes (background async): if compression threshold crossed, call `compressEpisodicMemory`, update `character_memory.episodic_summary`
- [ ] **M5-04** After stream completes: insert completed turn into `debate_turns` table
- [ ] **M5-05** Server function `createDebate(topic, format, participantIds)` → inserts debate + blank memory rows, returns `debateId`
- [ ] **M5-06** Server function `getDebate(debateId)` → returns debate + all turns + all character memory rows
- [ ] **M5-07** Server function `getCharacters(filters?: { tags?, era? })` → returns character list from DB
- [ ] **M5-08** Server function `getCharacter(id)` → returns single character profile
- [ ] **M5-09** Server function `getSuggestedTopics(characterIds[])` → calls `claude-haiku-4-5-20251001`, returns 5 topic suggestions
- [ ] **M5-10** Server function `submitUserTurn(debateId, content)` → inserts turn with `characterId = null`, returns updated turn list
- [ ] **M5-11** Manual test: curl the SSE endpoint with a seeded debate, verify streaming end-to-end

---

## Milestone 6 — Character Browser UI

- [ ] **M6-01** `src/components/characters/CharacterCard.tsx` — shadcn `Card` with avatar, name, years, era, tag badges
- [ ] **M6-02** `src/components/characters/CharacterSearch.tsx` — text input + tag filter pills; filters grid client-side
- [ ] **M6-03** `src/components/characters/CharacterBio.tsx` — shadcn `Sheet`: bio, key works, known positions, suggested topics, "Add to Debate"
- [ ] **M6-04** `/characters` route — SSR load all characters, render search + grid, bio sheet on card click
- [ ] **M6-05** Verify: 34 characters load, filtering works, bio sheet opens correctly

---

## Milestone 7 — Debate Setup Flow

- [ ] **M7-01** `CharacterPicker.tsx` — multi-select grid, min 2 / max 4, roster strip at bottom
- [ ] **M7-02** `TopicInput.tsx` — free text + "Suggest Topics" button, clickable suggestion chips
- [ ] **M7-03** `FormatPicker.tsx` — shadcn `RadioGroup`, one option per format with turn diagram
- [ ] **M7-04** `DebateOptions.tsx` — `Switch` for "Join as Participant", `Select` for response length
- [ ] **M7-05** `/debate/new` route — multi-step wizard (Tabs, locked progression): Characters → Topic → Format → Options → Confirm
- [ ] **M7-06** Confirm button calls `createDebate()`, redirects to `/debate/$debateId`
- [ ] **M7-07** Validation: ≥2 characters to advance from Step 1; topic required for Step 2

---

## Milestone 8 — Debate Stage UI

- [ ] **M8-01** `StreamingText.tsx` — progressive token rendering, no animation jitter
- [ ] **M8-02** `TurnBubble.tsx` — avatar, name, role label, content, copy button
- [ ] **M8-03** `PodiumView.tsx` — 2–4 podiums, active speaker highlighted, streaming in podium area
- [ ] **M8-04** `TranscriptView.tsx` — scrolling turn bubbles, auto-scroll, live streaming turn at bottom
- [ ] **M8-05** `DebateControls.tsx` — Next Turn, Export, View Memory (debug), user Textarea + Submit
- [ ] **M8-06** `DebateHeader.tsx` — topic, format badge, participant avatars, turn counter
- [ ] **M8-07** `DebateStage.tsx` — composes all above; owns SSE state
- [ ] **M8-08** `src/lib/hooks/useDebateTurn.ts` — SSE client hook with delta dispatch, `[DONE]` handling, retry
- [ ] **M8-09** `/debate/$debateId` route — SSR load, mount `<DebateStage>`, Next Turn triggers hook
- [ ] **M8-10** Verify end-to-end: streaming, memory updates, state persists on refresh

---

## Milestone 9 — User Participation Mode

- [ ] **M9-01** Show user `<Textarea>` in controls after each AI turn when participating
- [ ] **M9-02** On submit: call `submitUserTurn()`, update transcript immediately
- [ ] **M9-03** After user turn saved, trigger next AI character's turn
- [ ] **M9-04** Verify AI characters engage with user content directly

---

## Milestone 10 — Home Page

- [ ] **M10-01** `src/data/featured-debates.ts` — 8–10 curated pairings (character pair + topic + description)
- [ ] **M10-02** `FeaturedDebateCard.tsx` — two avatars, topic, description, "Start This Debate" button
- [ ] **M10-03** `/` home page — hero + CTA + featured debates grid + link to character browser
- [ ] **M10-04** Verify home page loads with no AI calls (fully static)

---

## Milestone 11 — Export & Polish

- [ ] **M11-01** `src/lib/export.ts` — `exportDebateMarkdown(debate, turns, characters): string`
- [ ] **M11-02** Wire export button — `Blob` + `URL.createObjectURL` download
- [ ] **M11-03** Loading skeleton on debate stage (shadcn `Skeleton`)
- [ ] **M11-04** Error boundary on debate route — retry option on SSE failure
- [ ] **M11-05** Toast notifications (sonner) — debate created, turn saved, export downloaded, errors
- [ ] **M11-06** Mobile responsiveness — Transcript View default on mobile, thumb-accessible controls

---

## Milestone 12 — Post-MVP (P1/P2)

- [ ] **M12-01** Shareable debate URLs: `isPublic` column + `/debate/$debateId/view` read-only route
- [ ] **M12-02** "Random Debate" — random pair + `getSuggestedTopics` → pre-filled setup
- [ ] **M12-03** "Great Debates" — pre-seeded public debates on home page
- [ ] **M12-04** PDF export via `@react-pdf/renderer`
- [ ] **M12-05** Accuracy indicators — per-paragraph `verified / extrapolated / speculative` classification
- [ ] **M12-06** Multi-character (3–4) debates — round-robin turns, 3–4 podiums
- [ ] **M12-07** Rate limiting — IP-based, 50 AI turns/day, 429 with friendly UI message
