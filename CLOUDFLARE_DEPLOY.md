# Deploying to Cloudflare

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- `wrangler` CLI installed (already in devDependencies — run `bun install`)
- Authenticated: `~/.bun/bin/bunx wrangler login`

> **Note:** Bun is installed at `~/.bun/bin/`. If `bun` / `bunx` are not in your PATH, prefix commands with `~/.bun/bin/`.

---

## 1. Create the D1 Database

```bash
bunx wrangler d1 create historical-debate-sim
```

Copy the `database_id` from the output and paste it into `wrangler.jsonc`:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "historical-debate-sim",
      "database_id": "YOUR_DATABASE_ID_HERE"  // ← paste here
    }
  ]
}
```

Also add it to `.env.local`:

```
CLOUDFLARE_D1_DATABASE_ID=YOUR_DATABASE_ID_HERE
```

---

## 2. Run Migrations

Apply the Drizzle-generated SQL migrations:

```bash
# Remote (production D1)
bunx wrangler d1 migrations apply historical-debate-sim --remote

# Local D1 simulator (for local dev with wrangler dev)
bunx wrangler d1 migrations apply historical-debate-sim --local
```

Migrations live in `drizzle/`. Re-run `bunx drizzle-kit generate` after any schema changes.

---

## 3. Seed the Characters

The seed SQL is pre-generated at `drizzle/seed.sql` (34 character INSERT statements).
To regenerate it after character data changes:

```bash
bun run seed:sql   # regenerates drizzle/seed.sql
```

To apply the seed:

```bash
# Remote D1 (production)
bunx wrangler d1 execute historical-debate-sim --remote --file=drizzle/seed.sql

# Local D1 simulator
bunx wrangler d1 execute historical-debate-sim --local --file=drizzle/seed.sql

# Or use the combined script (generates SQL + applies locally)
bun run seed
```

Verify the seed worked:

```bash
bunx wrangler d1 execute historical-debate-sim --local \
  --command="SELECT COUNT(*) as count FROM characters"
# Expected: count = 34
```

---

## 4. Set the Anthropic API Key as a Secret

```bash
bunx wrangler secret put ANTHROPIC_API_KEY
```

Paste your key when prompted. This stores it encrypted — never put it in `wrangler.jsonc`.

---

## 5. Build & Deploy

```bash
bun run build
bunx wrangler deploy
```

Wrangler will output your deployment URL (e.g. `https://historical-debate-sim.YOUR_SUBDOMAIN.workers.dev`).

---

## 6. Custom Domain (Optional)

In the Cloudflare dashboard:

1. Go to **Workers & Pages** → your worker → **Settings** → **Domains & Routes**
2. Click **Add Custom Domain**
3. Enter your domain (must be on Cloudflare DNS)

Or via CLI:

```bash
bunx wrangler deploy --route "yourdomain.com/*"
```

---

## Local Development with Wrangler

To run the app locally with the D1 simulator (instead of `vite dev`):

```bash
bunx wrangler dev
```

This uses the local D1 database persisted at `.wrangler/state/`. Run migrations and seed against it first (Steps 2 & 3 with `--local`).

Your `ANTHROPIC_API_KEY` can also be set in `.env.local` — Wrangler picks it up automatically for local dev.

---

## CI/CD with GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bun run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

Add `CLOUDFLARE_API_TOKEN` to your GitHub repo secrets (Settings → Secrets).
Generate a token at: Cloudflare Dashboard → My Profile → API Tokens → Create Token → use the **Edit Cloudflare Workers** template.

---

## Environment Variables Reference

| Variable | Where set | Used for |
|---|---|---|
| `ANTHROPIC_API_KEY` | `wrangler secret` / `.env.local` | All Claude API calls |
| `CLOUDFLARE_ACCOUNT_ID` | `.env.local` | `drizzle-kit` remote migrations |
| `CLOUDFLARE_D1_DATABASE_ID` | `.env.local` + `wrangler.jsonc` | `drizzle-kit` + D1 binding |
| `CLOUDFLARE_D1_TOKEN` | `.env.local` | `drizzle-kit` remote migrations |
