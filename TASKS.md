# Tasks — Historical Debate Simulator

Tasks are organized by milestone. Complete milestones in order — each builds on the previous.
Status: `[ ]` pending · `[x]` done · `[-]` blocked · `[~]` in progress

---

## Milestone 1 — Project Scaffolding

- [ ] **M1-01** Initialize TanStack Start project with Bun: `bunx create-tsrouter-app@latest . --framework=start --tailwind --typescript`
- [ ] **M1-02** Enable TypeScript strict mode in `tsconfig.json`
- [ ] **M1-03** Initialize shadcn/ui: `bunx shadcn@latest init` (choose neutral base color, CSS variables enabled)
- [ ] **M1-04** Install shadcn components: `button card dialog badge avatar select scroll-area separator sheet skeleton toast tabs radio-group textarea input`
- [ ] **M1-05** Install core dependencies: `bun add @anthropic-ai/sdk drizzle-orm better-sqlite3 hono`
- [ ] **M1-06** Install dev dependencies: `bun add -d drizzle-kit @types/better-sqlite3`
- [ ] **M1-07** Create `.env.local` with `ANTHROPIC_API_KEY` placeholder and add `.env.local` to `.gitignore`
- [ ] **M1-08** Create `src/server/db/schema.ts` with four tables: `characters`, `debates`, `debate_turns`, `character_memory`
- [ ] **M1-09** Create `src/server/db/index.ts` — initialize Drizzle with better-sqlite3, export `db`
- [ ] **M1-10** Run `bunx drizzle-kit generate` and `bunx drizzle-kit migrate` to create the SQLite database
- [ ] **M1-11** Verify all four tables exist in the generated database file
- [ ] **M1-12** Set up Hono app instance for API routes — configure it to run inside TanStack Start's Vite plugin

---

## Milestone 2 — TypeScript Interfaces & Types

- [ ] **M2-01** Define `CharacterProfile` interface in `src/types/character.ts`:
  - `id`, `name`, `years`, `era`, `avatarUrl`, `tags[]`
  - `keyWorks[]`, `coreBeliefs[]`, `rhetoricalStyle`
  - `knownPositions: Record<string, string>`
  - `suggestedOpponents[]`, `suggestedTopics[]`, `sampleQuotes[]`
- [ ] **M2-02** Define `WorkingMemory` interface in `src/types/memory.ts`:
  - `characterId`, `debateId`, `myMainThesis`
  - `keyArgumentsMade[]`, `opponentArguments: Record<string, string[]>`
  - `pointsNotYetAddressed[]`, `emotionalState`, `currentMomentum`
  - `nextTurnStrategy`, `concessions[]`, `positionRefinements[]`
- [ ] **M2-03** Define `DebateFormat` type: `'oxford' | 'lincoln-douglas' | 'socratic' | 'townhall'`
- [ ] **M2-04** Define `TurnRole` type: `'opening' | 'argument' | 'rebuttal' | 'cross-examination' | 'closing'`
- [ ] **M2-05** Define `DebateTurn` interface: `id`, `debateId`, `characterId | null`, `role`, `content`, `turnNumber`, `createdAt`
- [ ] **M2-06** Define `Debate` interface: `id`, `title`, `topic`, `format`, `participantIds[]`, `createdAt`

---

## Milestone 3 — Character Data

### JSON Profiles (one per character)

Create `src/data/characters/<id>.json` for each character using the `CharacterProfile` schema.

**Philosophy**
- [ ] **M3-01** `socrates.json`
- [ ] **M3-02** `plato.json`
- [ ] **M3-03** `aristotle.json`
- [ ] **M3-04** `immanuel-kant.json`
- [ ] **M3-05** `friedrich-nietzsche.json`
- [ ] **M3-06** `john-stuart-mill.json`
- [ ] **M3-07** `simone-de-beauvoir.json`
- [ ] **M3-08** `confucius.json`

**Religion & Theology**
- [ ] **M3-09** `thomas-aquinas.json`
- [ ] **M3-10** `martin-luther.json`
- [ ] **M3-11** `augustine-of-hippo.json`
- [ ] **M3-12** `maimonides.json`
- [ ] **M3-13** `ibn-rushd.json`

**Science**
- [ ] **M3-14** `charles-darwin.json`
- [ ] **M3-15** `marie-curie.json`
- [ ] **M3-16** `galileo-galilei.json`
- [ ] **M3-17** `nikola-tesla.json`

**Contemporary Thinkers**
- [ ] **M3-18** `richard-dawkins.json`
- [ ] **M3-19** `christopher-hitchens.json`
- [ ] **M3-20** `noam-chomsky.json`
- [ ] **M3-21** `sam-harris.json`
- [ ] **M3-22** `jordan-peterson.json`

**Politics & Economics**
- [ ] **M3-23** `karl-marx.json`
- [ ] **M3-24** `adam-smith.json`
- [ ] **M3-25** `abraham-lincoln.json`
- [ ] **M3-26** `frederick-douglass.json`
- [ ] **M3-27** `niccolo-machiavelli.json`
- [ ] **M3-28** `thomas-jefferson.json`
- [ ] **M3-29** `edmund-burke.json`
- [ ] **M3-30** `milton-friedman.json`

**Literature & Arts**
- [ ] **M3-31** `oscar-wilde.json`
- [ ] **M3-32** `george-orwell.json`
- [ ] **M3-33** `virginia-woolf.json`
- [ ] **M3-34** `leo-tolstoy.json`

### Life Knowledge Prompts (one per character)

Create `src/server/ai/life-knowledge/<id>.ts` for each character — exports a `const lifeKnowledge: string`. Each prompt is 400–600 words, first-person voice, covering: personal history, intellectual formation, complete worldview, emotional temperament, knowledge cutoff (for historical figures), what they reject.

- [ ] **M3-35** `socrates.ts`
- [ ] **M3-36** `plato.ts`
- [ ] **M3-37** `aristotle.ts`
- [ ] **M3-38** `immanuel-kant.ts`
- [ ] **M3-39** `friedrich-nietzsche.ts`
- [ ] **M3-40** `john-stuart-mill.ts`
- [ ] **M3-41** `simone-de-beauvoir.ts`
- [ ] **M3-42** `confucius.ts`
- [ ] **M3-43** `thomas-aquinas.ts`
- [ ] **M3-44** `martin-luther.ts`
- [ ] **M3-45** `augustine-of-hippo.ts`
- [ ] **M3-46** `maimonides.ts`
- [ ] **M3-47** `ibn-rushd.ts`
- [ ] **M3-48** `charles-darwin.ts`
- [ ] **M3-49** `marie-curie.ts`
- [ ] **M3-50** `galileo-galilei.ts`
- [ ] **M3-51** `nikola-tesla.ts`
- [ ] **M3-52** `richard-dawkins.ts`
- [ ] **M3-53** `christopher-hitchens.ts`
- [ ] **M3-54** `noam-chomsky.ts`
- [ ] **M3-55** `sam-harris.ts`
- [ ] **M3-56** `jordan-peterson.ts`
- [ ] **M3-57** `karl-marx.ts`
- [ ] **M3-58** `adam-smith.ts`
- [ ] **M3-59** `abraham-lincoln.ts`
- [ ] **M3-60** `frederick-douglass.ts`
- [ ] **M3-61** `niccolo-machiavelli.ts`
- [ ] **M3-62** `thomas-jefferson.ts`
- [ ] **M3-63** `edmund-burke.ts`
- [ ] **M3-64** `milton-friedman.ts`
- [ ] **M3-65** `oscar-wilde.ts`
- [ ] **M3-66** `george-orwell.ts`
- [ ] **M3-67** `virginia-woolf.ts`
- [ ] **M3-68** `leo-tolstoy.ts`

### DB Seed

- [ ] **M3-69** Create `src/server/db/seed.ts` — reads all JSON files from `src/data/characters/`, inserts into `characters` table
- [ ] **M3-70** Add `"seed"` script to `package.json`: `bun run src/server/db/seed.ts`
- [ ] **M3-71** Run seed and verify all 34 characters are in the database

---

## Milestone 4 — AI Memory Engine

- [ ] **M4-01** Create `src/server/ai/client.ts` — initialize Anthropic SDK from `ANTHROPIC_API_KEY` env var, export `anthropic`
- [ ] **M4-02** Create `src/server/ai/life-knowledge/index.ts` — dynamic import map from characterId → life knowledge string
- [ ] **M4-03** Create `src/server/ai/memory/working-memory.ts`:
  - `initWorkingMemory(characterId, debateId, topic): WorkingMemory` — returns blank working memory
  - `updateWorkingMemory(characterId, debateId, turnText, priorMemory): Promise<WorkingMemory>` — calls `claude-haiku-4-5-20251001` with `tool_use` to extract structured update, merges with prior state
- [ ] **M4-04** Create `src/server/ai/memory/episodic-compress.ts`:
  - `compressEpisodicMemory(characterId, debateId, turnsToCompress, existingSummary): Promise<string>` — calls `claude-haiku-4-5-20251001` to generate character-perspective narrative summary of old turns
- [ ] **M4-05** Create `src/server/ai/memory/context-assembly.ts`:
  - `assembleCharacterContext(characterId, debateId, topic, format, turnInstruction): Promise<{system: string, messages: Message[]}>` — loads life knowledge, working memory, episodic summary from DB, recent turns from DB, assembles full context object
- [ ] **M4-06** Create `src/lib/debate-formats.ts` — define format rules for Oxford, Lincoln-Douglas, Socratic, Town Hall:
  - `getTurnSequence(format): TurnRole[]`
  - `getTurnInstruction(format, role, turnNumber, speakerName, opponentNames): string`
  - `isUserTurn(format, role): boolean`
- [ ] **M4-07** Create `src/server/ai/debate-engine.ts`:
  - `getNextTurn(debateId): { characterId, role, turnNumber }` — determines whose turn it is based on format and existing turns
  - `shouldCompressEpisodic(debateId, characterId): boolean` — checks if turn count crosses threshold
- [ ] **M4-08** Write manual test script `scripts/test-memory.ts` — creates a fake 2-turn debate, calls `updateWorkingMemory`, logs result to verify structured output

---

## Milestone 5 — Debate API (SSE Endpoint)

- [ ] **M5-01** Create Hono route `GET /api/debate/turn` in `src/server/ai/debate-engine.ts`:
  - Validate `debateId` and `characterId` query params
  - Call `assembleCharacterContext`
  - Open Anthropic streaming request with `claude-sonnet-4-6`, max 1024 tokens
  - Return SSE response: stream `{ delta: string }` events, end with `[DONE]`
- [ ] **M5-02** After stream completes (inside background async): call `updateWorkingMemory`, save result to `character_memory` table
- [ ] **M5-03** After stream completes (inside background async): if compression threshold crossed, call `compressEpisodicMemory`, update `character_memory.episodic_summary`
- [ ] **M5-04** After stream completes: insert completed turn into `debate_turns` table
- [ ] **M5-05** Create TanStack Start server function `createDebate(topic, format, participantIds)` → inserts debate row, inserts one `character_memory` row per participant with blank working memory, returns `debateId`
- [ ] **M5-06** Create TanStack Start server function `getDebate(debateId)` → returns debate + all turns + all character memory rows
- [ ] **M5-07** Create TanStack Start server function `getCharacters(filters?: { tags?, era? })` → returns character list from DB
- [ ] **M5-08** Create TanStack Start server function `getCharacter(id)` → returns single character profile
- [ ] **M5-09** Create TanStack Start server function `getSuggestedTopics(characterIds[])` → calls `claude-haiku-4-5-20251001` with both character profiles and returns 5 topic suggestions
- [ ] **M5-10** Create TanStack Start server function `submitUserTurn(debateId, content)` → inserts a turn with `characterId = null`, returns updated turn list
- [ ] **M5-11** Manual test: curl the SSE endpoint with a seeded debate, verify streaming works end-to-end

---

## Milestone 6 — Character Browser UI

- [ ] **M6-01** Build `src/components/characters/CharacterCard.tsx` — shadcn `Card` with avatar, name, years, era, tag badges; click handler prop
- [ ] **M6-02** Build `src/components/characters/CharacterSearch.tsx` — text input + tag filter pills (shadcn `Badge` toggles); filters `CharacterCard` grid client-side
- [ ] **M6-03** Build `src/components/characters/CharacterBio.tsx` — shadcn `Sheet` content: avatar, name, era, bio excerpt, key works list, known positions, suggested topics, "Add to Debate" button
- [ ] **M6-04** Build `/characters` route (`src/routes/characters/index.tsx`):
  - Server-side: load all characters via `getCharacters()`
  - Render `<CharacterSearch>` + grid of `<CharacterCard>` components
  - Clicking a card opens `<CharacterBio>` sheet
- [ ] **M6-05** Verify character browser loads all 34 characters, filtering works, bio sheet opens correctly

---

## Milestone 7 — Debate Setup Flow

- [ ] **M7-01** Build `src/components/debate/setup/CharacterPicker.tsx` — multi-select grid of `<CharacterCard>`, enforces min 2 / max 4, shows selected characters as a "roster" strip at bottom
- [ ] **M7-02** Build `src/components/debate/setup/TopicInput.tsx` — free text `<Input>` + "Suggest Topics" button that calls `getSuggestedTopics()`, renders suggestions as clickable chips
- [ ] **M7-03** Build `src/components/debate/setup/FormatPicker.tsx` — shadcn `RadioGroup` with one option per format; each option shows format name, turn structure diagram, and duration
- [ ] **M7-04** Build `src/components/debate/setup/DebateOptions.tsx` — shadcn `Switch` for "Join as Participant"; shadcn `Select` for response length (concise / standard / extended)
- [ ] **M7-05** Build `src/routes/debate/new.tsx` — multi-step wizard using shadcn `Tabs` (locked progression): Step 1 Character Picker → Step 2 Topic → Step 3 Format → Step 4 Options → Confirm
- [ ] **M7-06** Wire confirm button: calls `createDebate()`, on success redirects to `/debate/$debateId`
- [ ] **M7-07** Add validation: cannot advance from Step 1 without ≥2 characters; cannot advance from Step 2 without a topic

---

## Milestone 8 — Debate Stage UI

- [ ] **M8-01** Build `src/components/debate/StreamingText.tsx` — renders text progressively as tokens arrive from SSE; accepts `onChunk` callback and `onComplete` callback; no animation jitter
- [ ] **M8-02** Build `src/components/debate/TurnBubble.tsx` — displays a single completed turn: character avatar (small), name, role label (`TurnRole`), full text content, copy button
- [ ] **M8-03** Build `src/components/debate/PodiumView.tsx`:
  - Renders 2–4 character podiums side by side
  - Active speaker highlighted (border, glow, or background change)
  - `<StreamingText>` renders in the active speaker's podium area
  - Completed turns collapse to a summary badge on each podium
- [ ] **M8-04** Build `src/components/debate/TranscriptView.tsx`:
  - Scrolling list of `<TurnBubble>` components, newest at bottom
  - Auto-scrolls to bottom on new content
  - Current streaming turn rendered as a live `<StreamingText>` at the bottom
- [ ] **M8-05** Build `src/components/debate/DebateControls.tsx`:
  - "Next Turn" button (disabled while streaming)
  - "Export" button (triggers Markdown download)
  - "View Memory" button (debug panel — shows active character's working memory JSON — toggleable)
  - User input `<Textarea>` + "Submit" button (rendered only when it's the user's turn)
- [ ] **M8-06** Build `src/components/debate/DebateHeader.tsx` — topic, format badge, participant avatars, turn counter (e.g. "Turn 4 of 8")
- [ ] **M8-07** Build `src/components/debate/DebateStage.tsx` — composes Header + Tabs (Podium / Transcript) + Controls; owns SSE connection state and streaming state
- [ ] **M8-08** Implement SSE client hook `src/lib/hooks/useDebateTurn.ts`:
  - Opens `fetch` to `/api/debate/turn?debateId=&characterId=`
  - Reads `ReadableStream` and dispatches `delta` tokens to state
  - Handles `[DONE]`, connection errors, and retry
- [ ] **M8-09** Build `src/routes/debate/$debateId.tsx`:
  - Server-side: load debate + turns + character memory via `getDebate()`
  - Client: mount `<DebateStage>` with loaded data
  - On "Next Turn" click: determine next character from format engine, trigger `useDebateTurn`
- [ ] **M8-10** Verify end-to-end: create a debate, watch turns stream, working memory updates happen in background, debate state persists across page refresh

---

## Milestone 9 — User Participation Mode

- [ ] **M9-01** When "Join as Participant" is enabled, after each AI turn show user input `<Textarea>` in `<DebateControls>`
- [ ] **M9-02** On user submit: call `submitUserTurn(debateId, content)`, update transcript immediately
- [ ] **M9-03** After user turn is saved, trigger next AI character's turn — they receive the user message as part of recent turns context
- [ ] **M9-04** Verify AI characters engage with user's content directly (check turn instruction wording instructs Claude to treat user as a named opponent)

---

## Milestone 10 — Home Page

- [ ] **M10-01** Define 8–10 curated featured debate pairings in `src/data/featured-debates.ts` (character pair + topic + description)
- [ ] **M10-02** Build `src/components/home/FeaturedDebateCard.tsx` — displays the two character avatars, topic, short description, "Start This Debate" button
- [ ] **M10-03** Build `src/routes/index.tsx` home page:
  - Hero section with tagline and "Start a Debate" CTA
  - Featured debates grid (from static data)
  - Link to character browser
- [ ] **M10-04** Verify home page loads without any AI calls (fully static render)

---

## Milestone 11 — Export & Polish

- [ ] **M11-01** Implement Markdown export in `src/lib/export.ts`:
  - `exportDebateMarkdown(debate, turns, characters): string` — formats full transcript with character names, roles, and topic header
- [ ] **M11-02** Wire export button in `<DebateControls>` — calls `exportDebateMarkdown`, triggers browser download via `Blob` + `URL.createObjectURL`
- [ ] **M11-03** Add loading skeleton to debate stage while initial data loads (shadcn `Skeleton`)
- [ ] **M11-04** Add error boundary to debate stage route — shows retry option if SSE connection fails
- [ ] **M11-05** Add toast notifications (shadcn `Toast`) for: debate created, turn saved, export downloaded, error states
- [ ] **M11-06** Mobile responsiveness pass: debate stage defaults to Transcript View on mobile; character picker scrolls properly; controls are thumb-accessible

---

## Milestone 12 — Post-MVP (P1/P2)

- [ ] **M12-01** Shareable debate URLs: add `isPublic` column to `debates` table; build public `/debate/$debateId/view` read-only route
- [ ] **M12-02** "Random Debate" feature: pick two characters at random, call `getSuggestedTopics`, redirect to setup with pre-filled values
- [ ] **M12-03** "Great Debates" section: pre-generate 5–10 debates and seed into DB as `isPublic = true`; show on home page
- [ ] **M12-04** PDF export: add `@react-pdf/renderer`, build `DebateTranscriptPDF` component, wire to export button as second option
- [ ] **M12-05** Accuracy indicators: after each turn completes, call `claude-haiku-4-5-20251001` to classify paragraphs as `verified / extrapolated / speculative`; store in `debate_turns.accuracy` JSON column; display in Transcript View
- [ ] **M12-06** Multi-character (3–4 debaters): update turn engine to rotate through all participants; update Podium View to support 3–4 podiums; verify context assembly works for 3-way debates
- [ ] **M12-07** Rate limiting: implement IP-based turn counter in SQLite; return 429 after 50 AI turns per day per IP; show friendly message in UI
