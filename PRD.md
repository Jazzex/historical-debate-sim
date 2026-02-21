# Product Requirements Document
## Historical Debate Simulator

**Version**: 1.0
**Status**: Draft
**Last updated**: 2026-02-21

---

## 1. Overview

### 1.1 Vision

A web application that lets anyone watch or participate in intellectually rich debates between historical and contemporary figures — simulated by AI using each figure's actual documented beliefs, rhetorical style, and worldview. The app treats each character as a genuine mind: they have their own working memory, their own interpretation of the debate, and a knowledge base grounded in their real life and era.

### 1.2 Problem Statement

Engaging with ideas from history is often passive — you read what someone believed, but you never see those beliefs tested in live argument against an opposing worldview. There's no way to know how Martin Luther would respond to Richard Dawkins, how Machiavelli would answer Kant, or how you personally would fare arguing against Socrates. Existing debate tools and AI chat applications don't simulate this — they either produce generic summaries or single-character impersonations without memory, structure, or authentic intellectual tension.

### 1.3 Target Audience

- Students and educators in philosophy, history, theology, political science, and ethics
- Intellectually curious adults who enjoy ideas but aren't professional academics
- Writers and game designers looking for character voice reference
- Debate coaches and competitive debaters looking to stress-test arguments
- Anyone who has ever thought "I wonder what X would say to Y"

---

## 2. Goals & Success Metrics

### 2.1 Product Goals

| Goal | Description |
|---|---|
| Authentic character simulation | Each character argues from their real documented positions, not generic paraphrases |
| Genuine intellectual tension | Debates should feel like real arguments — characters pressure each other, shift ground, and respond to what was actually said |
| Accessibility | Non-academics should be able to jump into a debate with no prior knowledge of either figure |
| Discoverability | The app surfaces great debate pairings — users don't need to already know who to match |
| Replayability | The same two characters on the same topic should produce meaningfully different debates |

### 2.2 Success Metrics (MVP)

- Users complete at least 5 full debate turns per session on average
- >60% of sessions result in the user triggering at least one more debate after the first
- Qualitative user feedback rates character authenticity ≥4/5
- Median time-to-first-debate-turn from landing page < 90 seconds

---

## 3. User Personas

### 3.1 The Curious Generalist — "Alex"
Mid-20s, works in tech, reads broadly but has no academic philosophy background. Heard a podcast about Nietzsche and wants to see what he'd say to a contemporary thinker. Wants to be entertained and learn something. Low tolerance for setup friction. Will share interesting exchanges on social media.

### 3.2 The Student — "Priya"
College junior studying political philosophy. Wants to use the app to stress-test arguments she's working through for a paper. Will participate as a debate opponent herself. Cares about accuracy — will be annoyed if a character says something factually wrong.

### 3.3 The Debate Coach — "Marcus"
High school debate coach. Uses the app to show students how strong arguments are constructed and rebutted. Wants to control the format (Lincoln-Douglas, Oxford). Wants to export transcripts for classroom use.

### 3.4 The Hobbyist — "Sandra"
Retired teacher, 60s. Became interested in the app because of its novelty. Less technically sophisticated. Needs the interface to be clear and unintimidating. Wants to watch debates more than participate. Will recommend to book clubs.

---

## 4. Functional Requirements

Priority levels: **P0** = must ship at launch | **P1** = ship in first iteration post-launch | **P2** = future

---

### 4.1 Character System

| ID | Requirement | Priority |
|---|---|---|
| C-01 | Each character has a structured profile: name, years lived, era, tags, key works, known positions, suggested opponents, suggested topics | P0 |
| C-02 | Each character has a life knowledge prompt: a first-person narrative (~400–600 words) covering personal history, intellectual formation, complete worldview, emotional temperament, and a hard knowledge cutoff at their death year (for historical figures) | P0 |
| C-03 | Historical figures must not reference events, concepts, or technologies from after their death without explicit framing through their own period's lens | P0 |
| C-04 | Contemporary figures (Dawkins, Chomsky, etc.) have full knowledge up to the present and awareness of historical figures as documented subjects | P0 |
| C-05 | Launch roster of at least 30 characters across philosophy, religion, science, politics, and literature (see Section 7) | P0 |
| C-06 | Character browser: searchable, filterable by era and topic tag | P0 |
| C-07 | Character profile card with biography, key works, known positions, and suggested debate topics | P0 |
| C-08 | Characters can be added post-launch without code changes (data-driven) | P1 |
| C-09 | Users can suggest characters via a form | P2 |

---

### 4.2 Character Memory System

| ID | Requirement | Priority |
|---|---|---|
| M-01 | Each character maintains a **working memory** object (JSON) that is updated after every turn they speak. It tracks: their main thesis, arguments made, opponent arguments heard, unaddressed points, emotional state, momentum, next-turn strategy, concessions, and position refinements | P0 |
| M-02 | Working memory is updated via a structured Claude `tool_use` call immediately after each character's turn completes (non-blocking to the user) | P0 |
| M-03 | Each character maintains an **episodic memory**: a compressed narrative summary of the debate so far, written in their own internal voice from their own perspective | P0 |
| M-04 | Episodic memory is generated via a separate Claude call every time a character's turn count crosses a multiple of 10. It replaces the raw transcript for the compressed turns | P0 |
| M-05 | Characters in the same debate have **separate, private** episodic memories — Luther's summary of what Dawkins said is different from Dawkins' summary of what Luther said | P0 |
| M-06 | Full context assembled per turn: life knowledge (system prompt) + working memory state + episodic summary (if exists) + last 6–8 turns verbatim + turn instruction | P0 |
| M-07 | Memory state is persisted to the database so debates can be paused and resumed | P1 |

---

### 4.3 Debate Engine

| ID | Requirement | Priority |
|---|---|---|
| D-01 | Users can create a debate by selecting 2–4 participants, a topic, and a format | P0 |
| D-02 | Topic can be typed freely or selected from AI-suggested topics for the chosen character pair | P0 |
| D-03 | Four debate formats supported at launch: Oxford, Lincoln-Douglas, Socratic Dialogue, Town Hall (see Section 6) | P0 |
| D-04 | Each format enforces its own turn structure, role sequence (opening / argument / rebuttal / closing), and timing rules | P0 |
| D-05 | Character responses are streamed token-by-token to the UI via Server-Sent Events | P0 |
| D-06 | Each turn's full text is saved to the database upon completion | P0 |
| D-07 | Debates can be paused and resumed at any point — state is fully persisted | P1 |
| D-08 | Users can set response length: concise (100–150 words), standard (150–250 words), extended (300–400 words) | P1 |
| D-09 | Users can manually skip a turn or prompt a character to speak out of order | P1 |
| D-10 | Multi-character debates (3–4 participants) distribute turns in round-robin order, with each character responding to the previous speaker | P1 |

---

### 4.4 User Participation Mode

| ID | Requirement | Priority |
|---|---|---|
| U-01 | When enabled, the user is added as a named participant in the debate | P0 |
| U-02 | After each AI character turn, the user is presented with a text input to respond | P0 |
| U-03 | The user's message is injected into the debate history and each AI character responds to it in character | P0 |
| U-04 | AI characters are instructed to treat the user as a contemporary opponent arguing their own views — they engage seriously, not condescendingly | P0 |
| U-05 | User can toggle between observer and participant mid-debate | P1 |

---

### 4.5 Debate Stage UI

| ID | Requirement | Priority |
|---|---|---|
| UI-01 | Two view modes: **Podium View** (visual, immersive) and **Transcript View** (chat-style, readable) | P0 |
| UI-02 | Podium View: character avatars displayed on opposing sides; active speaker highlighted; speech text streams in below their avatar | P0 |
| UI-03 | Transcript View: scrolling list of labeled turn bubbles (name + role + content) with copy-turn button | P0 |
| UI-04 | Character sidebar (shadcn Sheet): clicking a character's avatar opens a panel showing their bio, known positions, and life summary | P0 |
| UI-05 | Turn role is labeled on each bubble: Opening Statement, Main Argument, Rebuttal, Cross-Examination, Closing Statement | P0 |
| UI-06 | Active speaker has a visual "speaking" indicator while streaming | P0 |
| UI-07 | Debate controls: Next Turn, Pause, Export, and (if participating) Submit Response | P0 |
| UI-08 | Top bar shows: debate topic, format, participants, and turn count | P0 |
| UI-09 | Responsive — usable on mobile (transcript view) and desktop (podium view) | P1 |

---

### 4.6 Home Page & Discovery

| ID | Requirement | Priority |
|---|---|---|
| H-01 | Home page shows featured debate pairings with topic suggestions (curated, not AI-generated on page load) | P0 |
| H-02 | "Start a Debate" CTA is prominent and leads directly to the setup flow | P0 |
| H-03 | Recently completed debates (if authenticated) are shown on home page | P1 |
| H-04 | Curated "Great Debates" section: pre-generated example debates that users can view, continue, or remix | P1 |
| H-05 | "Random Debate" button picks two characters and a topic at random and starts immediately | P1 |

---

### 4.7 Export & Sharing

| ID | Requirement | Priority |
|---|---|---|
| E-01 | Export full debate transcript as Markdown file | P0 |
| E-02 | Shareable URL for any completed debate (public read link) | P1 |
| E-03 | Export transcript as PDF with character names and role labels | P1 |
| E-04 | Copy individual turn to clipboard | P1 |

---

### 4.8 Accuracy Indicators (Post-MVP)

| ID | Requirement | Priority |
|---|---|---|
| A-01 | After each turn is generated, a secondary Claude call classifies each paragraph as: `verified` (directly from known writings), `extrapolated` (consistent with their views), or `speculative` (reasonable inference) | P2 |
| A-02 | Accuracy classifications are displayed as subtle color coding in Transcript View with a tooltip explanation | P2 |
| A-03 | Users can toggle accuracy indicators on/off | P2 |

---

## 5. Non-Functional Requirements

### 5.1 Performance
- First debate turn must begin streaming within 3 seconds of request
- Working memory update must complete within 5 seconds after turn stream ends (background, not blocking UI)
- Character browser must load < 1 second (server-rendered, data pre-fetched)
- Episodic compression may take up to 10 seconds — must be fully background, never blocks UI

### 5.2 Reliability
- If a streaming request fails mid-turn, the client must offer a retry without losing prior debate state
- Working memory update failures must be logged but must not surface errors to the user
- Database writes must succeed or retry before moving to the next turn

### 5.3 Security
- `ANTHROPIC_API_KEY` must never be exposed to the client
- All Claude calls are server-side only
- SSE endpoint must validate that the requested `debateId` exists before opening stream

### 5.4 Cost Management
- Each debate turn uses `claude-sonnet-4-6` for the main response (~1,024 output tokens)
- Working memory updates use `claude-haiku-4-5-20251001` (faster, cheaper, structured output)
- Episodic compression uses `claude-haiku-4-5-20251001`
- Rate limiting: max 50 AI turns per IP per day for anonymous users (configurable)

### 5.5 Accessibility
- All interactive elements keyboard-navigable
- Character cards and turn bubbles have appropriate ARIA labels
- Streaming text does not use animations that cause motion sickness (no bouncing, just type-in)

---

## 6. Debate Format Specifications

### Oxford Style
- **Proposition**: One character argues "for" the topic, one "against"
- **Turn order**: Opening (A) → Opening (B) → Argument (A) → Argument (B) → Rebuttal (A) → Rebuttal (B) → Closing (A) → Closing (B)
- **User participation**: User may speak once after the argument round
- **Duration**: 8 turns total (4 per character)

### Lincoln-Douglas
- **Proposition**: Binary resolution with affirmative and negative positions
- **Turn order**: Affirmative Constructive → Negative Cross-Ex → Negative Constructive → Affirmative Cross-Ex → First Affirmative Rebuttal → Negative Rebuttal → Second Affirmative Rebuttal
- **User participation**: User acts as cross-examiner on Cross-Ex turns
- **Duration**: 7 turns

### Socratic Dialogue
- **Proposition**: No fixed positions; one character leads with questions, the other responds
- **Turn order**: Question (A) → Answer (B) → Follow-up or new question (A) → Answer (B)… (free-flowing)
- **User participation**: User may ask questions at any point
- **Duration**: Unlimited; user ends the dialogue

### Town Hall
- **Proposition**: No fixed positions; audience drives the questions
- **Turn order**: User submits a question → all characters respond in order
- **User participation**: Required — the user is the moderator/audience
- **Duration**: Unlimited; user ends by stopping

---

## 7. Initial Character Roster

### Philosophy (8)
Socrates, Plato, Aristotle, Immanuel Kant, Friedrich Nietzsche, John Stuart Mill, Simone de Beauvoir, Confucius

### Religion & Theology (5)
Thomas Aquinas, Martin Luther, Augustine of Hippo, Maimonides, Ibn Rushd (Averroes)

### Science (4)
Charles Darwin, Marie Curie, Galileo Galilei, Nikola Tesla

### Contemporary Thinkers (5)
Richard Dawkins, Christopher Hitchens, Noam Chomsky, Sam Harris, Jordan Peterson

### Politics & Economics (8)
Karl Marx, Adam Smith, Abraham Lincoln, Frederick Douglass, Niccolò Machiavelli, Thomas Jefferson, Edmund Burke, Milton Friedman

### Literature & Arts (4)
Oscar Wilde, George Orwell, Virginia Woolf, Leo Tolstoy

**Total at launch: 34 characters**

---

## 8. User Stories

```
As a curious user,
I want to pick two historical figures and a topic and immediately start watching them debate,
so that I can explore ideas in an engaging, interactive way.

As a student,
I want to participate in a debate against a historical philosopher,
so that I can test my understanding of their arguments by having to counter them.

As an educator,
I want to export a debate transcript as a PDF,
so that I can use it as a classroom discussion prompt.

As a curious user,
I want the app to suggest good debate pairings and topics when I pick a character,
so that I don't need prior knowledge to find an interesting debate.

As a user mid-debate,
I want to click on a character's avatar and read their real biography and key works,
so that I can understand the historical context behind what they're arguing.

As a returning user,
I want to be able to share a debate transcript via a link,
so that I can discuss it with friends.

As a user,
I want characters to remember what was said earlier in the debate and build on it,
so that the debate feels like a real developing intellectual exchange, not a series of disconnected speeches.
```

---

## 9. Out of Scope (MVP)

The following are explicitly deferred and will not be built for initial launch:

- User authentication / accounts (debates are session-based for MVP)
- Accuracy indicators (P2 — requires secondary classification pass per turn)
- PDF export (P1 — Markdown export ships at launch)
- Pre-seeded "Great Debates" (P1)
- Mobile-native app
- Audio/voice output (text-to-speech for each character)
- User-submitted custom characters
- Community features (voting, commenting on shared debates)
- Multi-language support

---

## 10. Open Questions

| # | Question | Owner | Status |
|---|---|---|---|
| OQ-1 | Authentication strategy — session-only for MVP or add simple auth (Lucia, Clerk)? | TBD | Open |
| OQ-2 | Hosting — Fly.io (persistent SQLite) vs. Railway vs. Vercel + Postgres? | TBD | Open |
| OQ-3 | Character avatar art — public domain historical portraits vs. AI-generated illustrations vs. text-only avatars for launch? | TBD | Open |
| OQ-4 | Should life knowledge prompts be editable by admins via a CMS, or are they hardcoded TypeScript files? | TBD | Open |
| OQ-5 | Should the working memory state be visible to the user (as a "debug" panel showing what the character is thinking)? | TBD | Open |
| OQ-6 | Rate limiting approach — IP-based, session token, or rely on hosting-layer limits for MVP? | TBD | Open |
| OQ-7 | What model to use for working memory updates and episodic compression — Haiku for cost, or Sonnet for accuracy? | TBD | Open |
