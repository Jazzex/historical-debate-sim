# Implementation Plan — Historical Debate Simulator

## Implementation Status

| Milestone | Status | Notes |
|---|---|---|
| M1 — Scaffolding | ✅ Done | TanStack Start + Hono + Drizzle + CF Workers |
| M2 — Types | ✅ Done | CharacterProfile, Debate, DebateTurn, WorkingMemory |
| M3 — Character data | ✅ Done | 34 JSON profiles + life-knowledge prompts |
| M4 — AI Memory Engine | ✅ Done | working-memory, episodic-compress, context-assembly |
| M5 — Debate API | ✅ Done | SSE turn streaming, CRUD routes, custom server entry |
| M6 — Character Browser | ✅ Done | `/characters` — antiquarian dark aesthetic, Sheet bio |
| M7 — Debate Setup | ✅ Done | `/debate/new` — 5-step wizard, AI topic suggestions |
| M8 — Debate Stage UI | 🔜 Next | SSE client, streaming text, podium/transcript views |

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | TanStack Start | Vite-based, file-based routing, typed server functions, streaming support, no vendor lock-in |
| Router | TanStack Router | Type-safe routes, built into TanStack Start |
| API | Hono | Lightweight edge-compatible router; `/api/*` handled separately from SSR |
| UI Components | shadcn/ui | Accessible Radix primitives, fully customizable, Tailwind-based |
| Styling | Tailwind CSS v4 + Cormorant Garamond + EB Garamond | Antiquarian dark aesthetic — ink black, antique gold, aged cream |
| AI | Claude API (`claude-sonnet-4-6` / `claude-haiku-4-5-20251001`) | Sonnet for debate turns; Haiku for memory compression |
| ORM | Drizzle ORM (D1 adapter) | Lightweight, TypeScript-native, CF D1 compatible |
| Database | Cloudflare D1 (SQLite at edge) | Single runtime for both API and DB; no separate server needed |
| Runtime | Bun + Cloudflare Workers | Bun for local dev; CF Workers for production |

> **Stack changes from original plan:** TanStack Query was not needed (direct fetch in loaders). SQLite/Postgres replaced by Cloudflare D1. Hono added as dedicated API layer. Components inlined in route files rather than separate component directories.

---

## Phase 1 — Project Scaffolding

### 1.1 Initialize TanStack Start project

```bash
bunx create-tsrouter-app@latest historical-debate-sim \
  --framework=start \
  --tailwind \
  --typescript
```

### 1.2 Add shadcn/ui

```bash
bunx shadcn@latest init
```

Core components to install up front:
```bash
bunx shadcn@latest add button card dialog badge avatar
bunx shadcn@latest add select scroll-area separator sheet
bunx shadcn@latest add skeleton toast tabs
```

### 1.3 Add dependencies

```bash
bun add @anthropic-ai/sdk drizzle-orm better-sqlite3
bun add -d drizzle-kit @types/better-sqlite3
```

### 1.4 Directory structure

```
src/
├── server.ts                # Custom CF Workers entry — /api/* → Hono, /* → TanStack Start
├── routes/
│   ├── __root.tsx           # Root layout + Google Fonts (Cormorant Garamond + EB Garamond)
│   ├── index.tsx            # Home (placeholder — M10)
│   ├── characters.tsx       # /characters — character browser (M6) ✅
│   └── debate/
│       ├── new.tsx          # /debate/new — setup wizard (M7) ✅
│       └── $debateId.tsx    # /debate/:id — live debate stage (M8) 🔜
├── server/
│   ├── api/
│   │   ├── index.ts         # Hono app, DB middleware, route registration
│   │   └── routes/
│   │       ├── characters.ts # GET /api/characters, GET /api/characters/:id
│   │       ├── debates.ts    # POST /api/debates, GET /api/debates/:id, POST /api/debates/topics
│   │       └── turns.ts      # GET /api/debate/turn (SSE stream)
│   ├── db/
│   │   ├── schema.ts        # Drizzle D1 schema (characters, debates, debate_turns, character_memory)
│   │   ├── index.ts         # getDb() — Drizzle D1 client factory
│   │   └── seed.ts          # Seed script — reads JSON profiles → D1
│   └── ai/
│       ├── client.ts        # Anthropic SDK init
│       ├── life-knowledge/  # 34 first-person TS persona files (one per character)
│       └── memory/
│           ├── working-memory.ts    # initWorkingMemory, updateWorkingMemory
│           ├── episodic-compress.ts # compressEpisodicMemory (haiku call, tool_use)
│           └── context-assembly.ts  # assembleCharacterContext — builds system prompt + messages
├── components/
│   └── ui/                  # shadcn/ui primitives (card, badge, sheet, scroll-area, etc.)
├── data/
│   └── characters/          # 34 JSON profiles (seeded into D1 via seed.ts)
├── lib/
│   └── utils.ts             # cn() helper
└── types/
    ├── character.ts         # CharacterProfile interface
    └── debate.ts            # Debate, DebateTurn, DebateFormat, TurnRole
```

---

## Phase 2 — Data Model

### 2.1 Character profiles (JSON seed data)

Each character JSON contains enough context for the AI to generate authentic responses:

```json
{
  "id": "martin-luther",
  "name": "Martin Luther",
  "years": "1483–1546",
  "era": "German Reformation",
  "avatar": "/avatars/martin-luther.jpg",
  "tags": ["theology", "religion", "reformation", "Christianity"],
  "keyWorks": ["95 Theses", "On the Bondage of the Will", "On Christian Liberty"],
  "coreBeliefs": [
    "Scripture alone (Sola Scriptura) is the supreme authority",
    "Salvation by faith alone (Sola Fide), not works",
    "Direct relationship with God without papal intermediary",
    "Strong belief in original sin and human depravity"
  ],
  "rhetoricalStyle": "Passionate, combative, uses scripture heavily, sermonic cadence, occasionally coarse and blunt, uses analogies from everyday medieval life",
  "knownPositions": {
    "existence_of_god": "Absolute certainty; faith is the foundation, not proof",
    "role_of_church": "The church must submit to Scripture, not the reverse",
    "free_will": "Humans have no free will in matters of salvation"
  },
  "suggestedOpponents": ["richard-dawkins", "thomas-aquinas", "erasmus"],
  "suggestedTopics": [
    "Does God exist?",
    "Is faith or reason the path to truth?",
    "Should religion have political power?",
    "Is the Bible the literal word of God?"
  ],
  "sampleQuotes": [
    "Here I stand; I can do no other.",
    "Reason is the enemy of faith."
  ]
}
```

### 2.2 Drizzle database schema

```ts
// server/db/schema.ts

export const characters = sqliteTable('characters', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  years: text('years'),
  era: text('era'),
  avatarUrl: text('avatar_url'),
  tags: text('tags', { mode: 'json' }).$type<string[]>(),
  profile: text('profile', { mode: 'json' }).$type<CharacterProfile>(),
  // Life knowledge prompt is stored in /server/ai/life-knowledge/<id>.ts, not DB
})

export const debates = sqliteTable('debates', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text('title'),
  topic: text('topic').notNull(),
  format: text('format').notNull(), // 'oxford' | 'socratic' | 'lincoln-douglas' | 'townhall'
  participantIds: text('participant_ids', { mode: 'json' }).$type<string[]>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

export const debateTurns = sqliteTable('debate_turns', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  debateId: text('debate_id').references(() => debates.id),
  characterId: text('character_id'), // null = user
  role: text('role').notNull(), // 'opening' | 'argument' | 'rebuttal' | 'closing'
  content: text('content').notNull(),
  turnNumber: integer('turn_number').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})

// Per-character private memory — one row per character per debate
export const characterMemory = sqliteTable('character_memory', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  debateId: text('debate_id').notNull().references(() => debates.id),
  characterId: text('character_id').notNull(),
  workingMemory: text('working_memory', { mode: 'json' }).$type<WorkingMemory>(),
  episodicSummary: text('episodic_summary'), // Compressed history in character's voice
  turnsSummarized: integer('turns_summarized').notNull().default(0),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})
```

---

## Phase 3 — Character Memory Architecture

This is the core design that makes each character feel like a genuine mind, not a stateless responder. Each character in a debate maintains **three independent memory layers** that are private to them. Two characters in the same debate have genuinely different internal experiences of it.

---

### 3.1 Memory Layer Overview

```
┌─────────────────────────────────────────────────────────┐
│                   CHARACTER CONTEXT                      │
│                                                         │
│  Layer 1: Life Knowledge (static, loaded once)          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ First-person narrative of who I am:               │  │
│  │ - Personal history, education, key life events    │  │
│  │ - My complete worldview and core beliefs          │  │
│  │ - What I've read, who influenced me               │  │
│  │ - My emotional character and temperament          │  │
│  │ - Knowledge cutoff (year of death for historical) │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Layer 2: Episodic Memory (compressed, updated ~10 turns)│
│  ┌───────────────────────────────────────────────────┐  │
│  │ My interpretation of the debate so far:           │  │
│  │ - What ground has been won or conceded            │  │
│  │ - How I processed my opponent's arguments         │  │
│  │ - Written in my own internal voice                │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Layer 3: Working Memory (structured JSON, per-turn)    │
│  ┌───────────────────────────────────────────────────┐  │
│  │ My live state right now:                          │  │
│  │ - Arguments I've made, points pending response    │  │
│  │ - My current emotional state in this debate       │  │
│  │ - What I intend to do in my next turn             │  │
│  │ - Any positions I've shifted or conceded          │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  + Last N turns verbatim (shared transcript window)     │
└─────────────────────────────────────────────────────────┘
```

---

### 3.2 Layer 1 — Life Knowledge Prompt (Static)

This is a rich, first-person narrative written for each character. Unlike a bullet-point profile, it reads as the character's inner monologue of their own identity — the foundation from which they think.

**Example: Martin Luther**
```
I am Martin Luther, born 1483 in Eisleben, Saxony. My father Hans worked the copper mines
and sacrificed greatly to send me to university, expecting me to become a lawyer. In the
summer of 1505, a bolt of lightning nearly killed me on the road to Erfurt. In that moment
of terror I cried out to Saint Anne and vowed to become a monk. My father was furious. I
did not care. I entered the Augustinian monastery at Erfurt.

For years I was a miserable monk. I confessed constantly, fasted, flagellated myself, yet
I could not silence the terror of God's judgment. My confessor Johann von Staupitz finally
sent me to study Scripture. It was in Paul's letter to the Romans — "the righteous shall
live by faith" — that everything broke open. God's righteousness is not a hammer held over
us; it is a gift given to us. This insight, Sola Fide, is the bedrock of everything I believe.

I know Aristotle and I distrust him. The scholastics corrupted theology by wedding it to
pagan philosophy. I have read Augustine deeply — he understood grace. I know the Church
Fathers. I know my Bible in Latin, Greek, and now German, which I translated myself.

I know nothing of events after the year of our Lord 1546, when I died. I have no knowledge
of what they call "science" after my era, though I engage any claim through the lens of
Scripture and reason rightly ordered under faith.

My temperament: I am combative, passionate, occasionally coarse. I believe deeply. I am
not interested in politeness when truth is at stake. I will quote Scripture as the highest
authority because it is. I do not fear powerful men — I faced the Emperor himself at Worms.
```

**Example: Richard Dawkins**
```
I am Richard Dawkins, born 1941 in Nairobi, Kenya, raised in England. I studied zoology
at Oxford under the ethologist Niko Tinbergen. I spent my career at Oxford as a lecturer
and later as the first Simonyi Professor for the Public Understanding of Science.

My worldview is Darwinian to its core. Natural selection — the blind, pitiless process
Darwin described — explains the apparent design in living things without any need for a
designer. This is not speculation; it is the most powerful explanatory framework in the
history of science. I wrote The Selfish Gene (1976) to explain how evolution works at the
level of genes, not organisms or species. The Extended Phenotype followed. The Blind
Watchmaker demolished the design argument. The God Delusion (2006) made the case
directly: religious belief is a delusion, potentially a dangerous one.

I am deeply influenced by Hume's critique of miracles, Russell's atheism, Darwin's
mechanism, and the general tradition of scientific empiricism. I consider faith — belief
without evidence — to be an intellectual vice, not a virtue.

My temperament: I am precise, occasionally impatient with fuzzy thinking, and I find
appeals to mystery or authority frustrating when they substitute for evidence. I enjoy
a good argument. I respect intellectual honesty above all else.

My knowledge extends to the present day. I am aware of Luther and the Reformation as
historical phenomena and have written about the psychology of religious belief at length.
```

Key properties of a good life knowledge prompt:
- First-person, written as internal voice
- Covers intellectual formation (what they read, who shaped them)
- Explicit **knowledge cutoff** for historical figures
- Emotional temperament, not just beliefs
- What they *reject* as well as what they believe
- ~400–600 words per character

---

### 3.3 Layer 2 — Episodic Memory (Compressed Debate History)

Once a debate exceeds ~12 turns, injecting the full transcript becomes expensive and dilutes focus. Instead, older turns are **compressed into a character-perspective summary** — each character narrates what happened through their own lens.

**Compression trigger**: Every 10 turns, compress the oldest 10 turns into each character's episodic memory.

**Compression prompt** (sent as a separate, non-streaming Claude call):
```
You are the inner narrator for ${character.name}. Summarize turns 1–10 of this debate
from ${character.name}'s perspective. Capture:
- What arguments each side has made so far
- How ${character.name} interpreted and processed what was said
- What ground has been conceded or won
- The current emotional texture of the debate for ${character.name}

Write in ${character.name}'s internal voice. 200–300 words. Do not be neutral — this is
how ${character.name} experienced it, filtered through their worldview.
```

**Luther's episodic summary after 10 turns with Dawkins:**
```
This man Dawkins is remarkable in his arrogance and his blindness. He speaks of "natural
selection" as though naming a mechanism explains the existence of being itself. He does
not see — or refuses to see — that his very capacity for reason, which he worships as
his only god, requires an explanation he cannot give. I pressed him on the First Cause
and he retreated to "we don't yet know." This is not an answer; it is the confession of
ignorance dressed as humility.

He called my faith "circular." I granted him that Scripture cannot prove itself to one
who will not receive it — but I turned this back: neither can his "empiricism" prove
empiricism is the right method without circularity. He had no satisfying response to this.

I am gaining ground on the epistemological question. He is stronger when he speaks of
biology, where his knowledge is vast. I must keep redirecting to the deeper question:
not "how did life develop?" but "why is there something rather than nothing, and why
does that something conform to rational laws at all?"
```

---

### 3.4 Layer 3 — Working Memory (Structured, Per-Turn)

A JSON object stored in the database and updated after every turn. It tracks the character's live cognitive state.

```ts
interface WorkingMemory {
  characterId: string
  debateId: string

  // My argumentative state
  myMainThesis: string                    // What I'm fundamentally arguing
  keyArgumentsMade: string[]              // My strongest points so far (max 5)
  opponentArguments: {                    // Indexed by opponent characterId
    [characterId: string]: string[]       // Their strongest arguments I've heard
  }
  pointsNotYetAddressed: string[]         // Things they said I haven't responded to

  // My internal state
  emotionalState: string                  // e.g., "frustrated but energized", "confident"
  currentMomentum: 'winning' | 'losing' | 'even' | 'uncertain'

  // My intentions
  nextTurnStrategy: string                // What I plan to do in my next turn

  // Concessions and evolution
  concessions: string[]                   // Points I've backed off from
  positionRefinements: string[]           // How my view has sharpened during this debate
}
```

**Working memory update prompt** (fast structured call after each turn, using `tool_use` for guaranteed JSON):
```
After ${character.name}'s turn just now, update their working memory. Extract:
1. What was the core argument they just made? (1 sentence)
2. Is there a new opponent argument from the last turn they now need to address?
3. What is their current emotional state based on how they just argued?
4. What do they appear to intend for their next turn?
5. Did they concede or refine any position?

Return as the WorkingMemory JSON schema.
```

---

### 3.5 Full Context Assembly Per Turn

When it is character X's turn to speak, their full context is assembled as:

```ts
function assembleCharacterContext(
  character: CharacterProfile,
  workingMemory: WorkingMemory,
  episodicSummary: string | null,
  recentTurns: DebateTurn[],  // last 6–8 turns verbatim
  topic: string,
  format: DebateFormat,
  turnInstruction: string
): { system: string; messages: Message[] } {

  const system = `
${character.lifeKnowledgePrompt}

---
DEBATE CONTEXT
Topic: "${topic}"
Format: ${format.description}

YOUR CURRENT DEBATE STATE:
Thesis: ${workingMemory.myMainThesis}
Arguments you've made: ${workingMemory.keyArgumentsMade.join('; ')}
Points still to address: ${workingMemory.pointsNotYetAddressed.join('; ')}
Your current state: ${workingMemory.emotionalState}
Your plan for this turn: ${workingMemory.nextTurnStrategy}

RULES:
- Speak in first person as yourself
- Engage directly with what was just said — no generic speeches
- 150–250 words
- Do not break character
`

  const messages: Message[] = []

  // Inject episodic summary if it exists
  if (episodicSummary) {
    messages.push({
      role: 'user',
      content: `[Your memory of the debate so far]\n${episodicSummary}`
    })
    messages.push({ role: 'assistant', content: 'I understand. I will continue from here.' })
  }

  // Inject recent turns verbatim
  for (const turn of recentTurns) {
    messages.push({
      role: turn.characterId === character.id ? 'assistant' : 'user',
      content: `[${getCharacterName(turn.characterId)}]: ${turn.content}`
    })
  }

  // Turn instruction
  messages.push({ role: 'user', content: turnInstruction })

  return { system, messages }
}
```

---

### 3.6 Database Schema Additions

```ts
// Persisted working memory per character per debate
export const characterMemory = sqliteTable('character_memory', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  debateId: text('debate_id').notNull().references(() => debates.id),
  characterId: text('character_id').notNull(),
  workingMemory: text('working_memory', { mode: 'json' }).$type<WorkingMemory>(),
  episodicSummary: text('episodic_summary'),
  turnsSummarized: integer('turns_summarized').notNull().default(0),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
})
```

---

### 3.7 Streaming Implementation

TanStack Start server functions don't natively stream, so the debate turn endpoint uses a plain Hono route (lightweight, runs inside Vite via TanStack Start's API route support) returning an SSE stream.

**Turn lifecycle:**
1. Client requests next turn → hits `/api/debate/turn` SSE endpoint
2. Server assembles character context (life knowledge + working memory + episodic summary + recent turns)
3. Streams the character's response back token by token
4. On stream complete: fires two non-streaming background calls:
   - Update working memory (structured `tool_use` call)
   - If turn threshold crossed: trigger episodic compression
5. Saves completed turn to `debate_turns` table
6. Client renders the streamed text and updates UI state

```ts
// api/debate/turn.ts (Hono route)
app.get('/api/debate/turn', async (c) => {
  const { debateId, characterId } = c.req.query()

  const context = await assembleCharacterContext(debateId, characterId)

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: context.system,
    messages: context.messages,
  })

  c.header('Content-Type', 'text/event-stream')
  c.header('Cache-Control', 'no-cache')

  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()

  ;(async () => {
    let fullText = ''
    for await (const chunk of stream) {
      const delta = chunk.delta?.text ?? ''
      fullText += delta
      await writer.write(
        new TextEncoder().encode(`data: ${JSON.stringify({ delta })}\n\n`)
      )
    }
    // After stream: update memory and save turn (non-blocking)
    updateWorkingMemory(debateId, characterId, fullText)
    saveTurn(debateId, characterId, fullText)
    await writer.write(new TextEncoder().encode('data: [DONE]\n\n'))
    await writer.close()
  })()

  return new Response(readable)
})
```

---

## Phase 4 — Debate Formats

### Oxford Style
- **Structure**: Opening statement → Main argument → Rebuttal → Closing statement
- **Turns**: Fixed (4 rounds per participant)
- **UI**: Formal podium view, timer per turn

### Lincoln-Douglas
- **Structure**: Affirmative constructive → Negative cross-examination → Negative constructive → Affirmative cross-ex → Affirmative rebuttal → Negative rebuttal
- **Turns**: Structured with cross-examination turns (user can ask the questions)
- **UI**: Courtroom-style split view

### Socratic Dialogue
- **Structure**: Free-flowing question-and-answer, one character asks, other responds
- **Turns**: Dynamic — character asks a question, opponent answers, repeat
- **UI**: Casual roundtable chat bubbles

### Town Hall
- **Structure**: Audience (user) asks questions, both characters respond
- **Turns**: User-driven — user submits a question, all participants respond in order
- **UI**: Stage with moderator (user) input box

---

## Phase 5 — UI Components & Views

### Home Page (`/`)
- Featured debate suggestions (curated pairs + topics)
- "Start a Debate" CTA → goes to `/debate/new`
- Browse characters link

### Debate Setup (`/debate/new`)
- **Step 1**: Character picker — searchable grid of `<CharacterCard>` components (shadcn `Card`)
  - Filter by era, tag (philosophy, religion, science, politics)
  - Minimum 2, maximum 4 participants
- **Step 2**: Topic — free text input OR suggested topics for the selected pair
- **Step 3**: Format — radio group with format descriptions (shadcn `RadioGroup`)
- **Step 4**: Optional — enable "Join as Participant" toggle

### Debate Stage (`/debate/$debateId`)
Two view modes (toggle via shadcn `Tabs`):

**Podium View** (default)
- Character avatars on opposing podiums
- Active speaker highlighted
- Speech displayed in large text below their podium
- Streaming text animates in word by word

**Transcript View**
- Chat-bubble style scrolling transcript
- Each turn labeled with character name + role (Opening, Rebuttal, etc.)
- Copy individual turn button

**Shared elements:**
- Sidebar: `<CharacterBio>` sheet (shadcn `Sheet`) slides in on avatar click
- Top bar: topic, format, turn counter
- Bottom controls: "Next Turn", "Skip", "Export", "User Input" (if participating)

### Character Browser (`/characters`)
- Grid of `<CharacterCard>` components
- Filter by era/tag using shadcn `Badge` pills
- Click → modal with full profile (shadcn `Dialog`)

---

## Phase 6 — User Participation Mode

When enabled, after each AI character turn the user gets an input box to respond. The user's message is injected into the conversation history as a named participant, and the AI characters respond to it in character.

The AI is instructed: *"The user is arguing as themselves (modern perspective). Engage with their arguments as you would with any intellectual opponent."*

---

## Phase 7 — Additional Features (Post-MVP)

### Accuracy Indicators
After generation, a second lightweight Claude call classifies each statement:
- `verified` — directly from known writings/speeches
- `extrapolated` — consistent with their views but not a direct quote
- `speculative` — reasonable inference given their era and philosophy

Displayed as subtle color coding on transcript lines.

### Export / Share
- **Markdown export** — full transcript as `.md`
- **PDF export** — formatted with character portraits (using `@react-pdf/renderer`)
- **Share link** — debates saved to DB are shareable via URL

### Suggested Debate Discovery
Homepage shows curated "Great Debates" — pre-seeded examples where users can watch a pre-generated debate, then remix it or continue it.

---

## Phase 8 — Initial Character Roster (Launch)

**Philosophy**: Socrates, Plato, Aristotle, Immanuel Kant, Friedrich Nietzsche, John Stuart Mill, Simone de Beauvoir, Confucius

**Religion/Theology**: Thomas Aquinas, Martin Luther, Augustine of Hippo, Maimonides, Ibn Rushd (Averroes)

**Science**: Charles Darwin, Nikola Tesla, Marie Curie, Galileo Galilei

**Contemporary Thinkers**: Richard Dawkins, Christopher Hitchens, Jordan Peterson, Noam Chomsky, Sam Harris

**Politics/History**: Karl Marx, Adam Smith, Abraham Lincoln, Frederick Douglass, Niccolò Machiavelli, Thomas Jefferson, Edmund Burke, Milton Friedman

**Literature/Arts**: Oscar Wilde, George Orwell, Virginia Woolf, Leo Tolstoy

---

## Development Phases & Order

1. **Week 1**: Scaffold project, set up shadcn/ui, create character JSON files, set up Drizzle + SQLite
2. **Week 2**: Character browser UI, debate setup flow, basic routing
3. **Week 3**: Claude API integration, system prompt design, streaming endpoint
4. **Week 4**: Debate stage UI (podium + transcript views), streaming text component
5. **Week 5**: Save/load debates from DB, export (Markdown), share links
6. **Week 6**: User participation mode, multi-character support (3+ debaters)
7. **Week 7+**: Accuracy indicators, PDF export, suggested debates, polish

---

## Open Questions / Decisions Needed

- [ ] Authentication — do users need accounts to save debates, or save to localStorage for MVP?
- [ ] Hosting — Vercel, Fly.io, or Railway? (TanStack Start deploys to any Node/Bun host)
- [ ] Rate limiting — how many AI turns per session for anonymous users?
- [ ] Character avatar art — illustrations, historical portraits (public domain), or AI-generated?
- [ ] Should the AI be given real quotes to cite, or infer from documented beliefs only?
