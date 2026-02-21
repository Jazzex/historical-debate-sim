# Deploying to Cloudflare

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- `wrangler` CLI installed (already in devDependencies — run `bun install`)
- Authenticated: `bunx wrangler login`

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

---

## 2. Run Migrations on D1

Apply the Drizzle migrations to the remote D1 database:

```bash
bunx wrangler d1 migrations apply historical-debate-sim --remote
```

To apply to the local D1 simulator (for local dev):

```bash
bunx wrangler d1 migrations apply historical-debate-sim --local
```

---

## 3. Set the Anthropic API Key as a Secret

```bash
bunx wrangler secret put ANTHROPIC_API_KEY
```

Paste your key when prompted. This stores it encrypted — never put it in `wrangler.jsonc`.

---

## 4. Build & Deploy

```bash
bun run build
bunx wrangler deploy
```

Wrangler will output your deployment URL (e.g. `https://historical-debate-sim.YOUR_SUBDOMAIN.workers.dev`).

---

## 5. Custom Domain (Optional)

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

To run the app locally with a real D1 simulator (instead of `vite dev`):

```bash
bunx wrangler dev
```

This uses the local D1 database at `.wrangler/state/`. Run migrations against it first (see Step 2).

Your `ANTHROPIC_API_KEY` can be set in `.env.local` for local dev — Wrangler will pick it up automatically.

---

## Seeding the Database

After migrations, seed characters:

```bash
# Remote D1
bunx wrangler d1 execute historical-debate-sim --remote --file=./drizzle/seed.sql

# Or run the seed script via wrangler (once implemented)
bunx wrangler d1 execute historical-debate-sim --remote --command="SELECT count(*) FROM characters"
```

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
