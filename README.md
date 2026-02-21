# Historical Debate Simulator

A web application that simulates structured debates between historical and contemporary figures, powered by Claude AI. Pit Martin Luther against Richard Dawkins on God's existence, have Socrates question Nietzsche on morality, or let Karl Marx debate Milton Friedman on economics.

## What It Does

- Select two or more historical/contemporary figures as debate participants
- Choose a debate topic (or let the app suggest one based on the characters)
- Watch the AI simulate an authentic, in-character debate with each figure arguing from their real documented positions, writing style, and rhetorical approach
- Optionally join as a participant and argue directly against historical figures
- Save, replay, and share debates

## Example Debates

| Debater A | Debater B | Topic |
|---|---|---|
| Martin Luther | Richard Dawkins | Does God exist? |
| Socrates | Friedrich Nietzsche | The basis of morality |
| Karl Marx | Milton Friedman | Free markets vs. central planning |
| Marie Curie | Nikola Tesla | The future of energy |
| Abraham Lincoln | Frederick Douglass | Reconstruction and racial equality |
| Simone de Beauvoir | Confucius | The role of women in society |
| Charles Darwin | Thomas Aquinas | Evolution and divine creation |
| Machiavelli | Immanuel Kant | Is deception ever justified? |

## Key Features

- **Per-Character Working Memory** — Each figure maintains their own private mind during the debate. Luther and Dawkins are not just reading the same transcript — they each experience and interpret the debate through their own worldview, tracking their own agenda, emotional state, and what they still need to address. They can be genuinely surprised, pressured, or energized.
- **Life Knowledge Context** — Every character starts from a rich first-person prompt covering their personal history, intellectual formation, complete worldview, and a knowledge cutoff (historical figures don't know what happened after they died). Luther has no concept of evolution; Dawkins knows Luther's writings as historical documents.
- **Episodic Memory Compression** — As debates grow long, each character compresses older turns into their own narrative summary written in their internal voice. Their memory of the debate is subjective, not a raw transcript.
- **Authentic Character Voices** — Each figure speaks using their documented rhetorical style, known arguments, and philosophical positions. Luther is passionate and theological; Dawkins is empirical and pointed.
- **Multiple Debate Formats** — Oxford-style, Socratic dialogue, Lincoln-Douglas, Town Hall
- **Real-time Streaming** — Responses stream token by token for a live debate feel
- **User Participation** — Join the debate yourself and argue against historical figures
- **Multi-participant Debates** — 3+ debaters in a roundtable or panel format
- **Topic Suggestions** — The app suggests historically relevant debate topics per character pair
- **Transcript Export** — Save debates as PDF, Markdown, or share via link
- **Historical Context Cards** — Sidebar cards showing each figure's era, key works, and real-world positions
- **Accuracy Indicators** — Highlights when a character's argument is directly sourced from their known writings vs. extrapolated

## Tech Stack

- **Framework**: TanStack Start (Vite + TanStack Router + Server Functions)
- **UI Components**: shadcn/ui (Radix UI primitives)
- **AI**: Anthropic Claude API (`claude-sonnet-4-6`)
- **Streaming**: Server-Sent Events via TanStack Start server functions
- **Data Fetching**: TanStack Query
- **Database**: SQLite + Drizzle ORM (dev) / PostgreSQL (prod)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

## Project Structure

```
historical-debate-sim/
├── app/
│   ├── page.tsx              # Home / character selection
│   ├── debate/
│   │   ├── [id]/page.tsx     # Active debate view
│   │   └── new/page.tsx      # Debate setup
│   └── api/
│       ├── debate/route.ts   # Streaming debate endpoint
│       └── characters/route.ts
├── lib/
│   ├── characters/           # Character profile definitions
│   ├── prompts/              # System prompt builders
│   └── debate-engine/        # Turn management, format logic
├── components/
│   ├── DebateStage/          # Main debate UI
│   ├── CharacterCard/        # Character selection cards
│   └── Transcript/           # Debate transcript view
├── prisma/
│   └── schema.prisma
└── data/
    └── characters/           # JSON profiles for each figure
```

## Getting Started

See [PLAN.md](./PLAN.md) for the full implementation plan and development roadmap.
