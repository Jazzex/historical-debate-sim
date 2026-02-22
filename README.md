# The Grand Council: Historical Debate Simulator

Watch history's greatest minds argue. Pick any two (or more) historical and contemporary figures, choose a topic and debate format, and let Claude bring them to life — complete with authentic voices, evolving memory, and genuine intellectual friction.

## What it does

- **34 historical and contemporary figures** — philosophers, scientists, writers, political thinkers
- **4 debate formats** — Oxford, Lincoln-Douglas, Socratic, Town Hall
- **AI memory engine** — each character tracks their own arguments, opponent moves, and strategic state across the whole debate using working memory + episodic compression
- **User participation** — optionally step in as one of the debaters
- **Streaming responses** — watch characters think in real time via SSE
- **Export** — download the full transcript as Markdown

## Roster

| Category | Figures |
|---|---|
| Ancient philosophy | Socrates, Plato, Aristotle, Confucius |
| Medieval & religious | Thomas Aquinas, Augustine, Maimonides, Ibn Rushd, Martin Luther |
| Enlightenment | Immanuel Kant, John Stuart Mill, Adam Smith, Thomas Jefferson, Edmund Burke |
| 19th century | Karl Marx, Friedrich Nietzsche, Charles Darwin, Abraham Lincoln, Frederick Douglass, Niccolò Machiavelli, Leo Tolstoy |
| Science | Marie Curie, Galileo Galilei, Nikola Tesla |
| 20th–21st century | Simone de Beauvoir, George Orwell, Virginia Woolf, Oscar Wilde, Milton Friedman, Noam Chomsky, Richard Dawkins, Christopher Hitchens, Sam Harris, Jordan Peterson |

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (React, file-based routing, SSR, server functions) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Cloudflare D1 (SQLite at the edge) |
| ORM | Drizzle ORM |
| API layer | Hono |
| AI | Anthropic SDK (`claude-sonnet-4-6` for debate turns, `claude-haiku-4-5-20251001` for memory) |
| Runtime | Cloudflare Workers |
| Package manager | Bun |

## Local development

### Prerequisites

- [Bun](https://bun.sh) — installed to `~/.bun/bin/bun`
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (for D1)
- An Anthropic API key

### Setup

```bash
# Install dependencies
~/.bun/bin/bun install
```

Create `.env.local` with your credentials:

```
ANTHROPIC_API_KEY=sk-ant-...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_D1_DATABASE_ID=...
CLOUDFLARE_D1_TOKEN=...
```

### Database

```bash
# Apply migrations to the local D1 simulator
~/.bun/bin/bunx wrangler d1 migrations apply grand-council --local

# Seed all 34 characters
~/.bun/bin/bun run seed
```

### Run

```bash
~/.bun/bin/bun run dev        # Vite dev server — http://localhost:3000
~/.bun/bin/bunx wrangler dev  # Full Cloudflare Workers runtime with local D1
```

### Test

```bash
~/.bun/bin/bun run test
```

150 unit tests covering schema, types, character profiles, debate format logic, memory initialization, and turn scheduling.

## Deployment

See [CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md) for the full step-by-step guide covering D1 setup, migrations, seeding, secrets, build, and optional CI/CD.

**Quick deploy** (after prerequisites are configured):

```bash
~/.bun/bin/bun run build
~/.bun/bin/bunx wrangler deploy
```

## Project structure

```
src/
  data/
    characters/          # 34 JSON character profiles
  lib/
    debate-formats.ts    # Turn sequences and instructions for each format
  server/
    ai/
      client.ts          # Anthropic SDK singleton
      debate-engine.ts   # Turn scheduling and compression threshold logic
      life-knowledge/    # 34 first-person knowledge prompts (one per character)
      memory/
        working-memory.ts     # Per-turn structured memory updates (haiku + tool_use)
        episodic-compress.ts  # Narrative compression of older turns (haiku)
        context-assembly.ts   # Assembles full system prompt + message history
    api/
      index.ts           # Hono app with Cloudflare bindings type
    db/
      schema.ts          # Drizzle schema (characters, debates, debate_turns, character_memory)
      index.ts           # getDb(d1) factory
      seed.ts            # Generates drizzle/seed.sql from character JSON
  types/
    character.ts         # CharacterProfile interface
    debate.ts            # Debate, DebateTurn, DebateFormat, TurnRole
    memory.ts            # WorkingMemory interface
scripts/
  test-memory.ts         # Manual integration test for the memory pipeline
drizzle/
  *.sql                  # Generated migrations
  seed.sql               # 34 INSERT statements (generated)
```

## How the memory engine works

Each character maintains two layers of memory across a debate:

**Working memory** — updated after every turn using `claude-haiku-4-5-20251001` with `tool_use`. Tracks thesis, arguments made, opponent moves, emotional state, and next-turn strategy as structured JSON.

**Episodic summary** — once a character has made more than 4 turns, older turns are compressed into a first-person narrative summary, keeping the context window lean while preserving debate history.

Both layers are loaded into the system prompt before each generation alongside that character's full life knowledge prompt, so every response is informed by who they are, what they've said, and what their opponent has argued.

## Scripts

| Script | What it does |
|---|---|
| `bun run dev` | Vite dev server |
| `bun run build` | Production build |
| `bun run test` | Run all tests |
| `bun run seed:sql` | Regenerate `drizzle/seed.sql` from character JSON |
| `bun run seed` | Regenerate + apply seed to local D1 |

> **Note:** Prefix commands with `~/.bun/bin/` if `bun` is not in your PATH.

## License

MIT
