/**
 * Custom Cloudflare Workers entry point.
 *
 * Routes:
 *   /api/*  → Hono app (characters, debates, SSE turn stream)
 *   /*      → TanStack Start (SSR, React router)
 *
 * TanStack Start picks this file up automatically as the server entry
 * because it resolves `src/server.ts` by default.
 */
import { createStartHandler, defaultStreamHandler } from '@tanstack/react-start/server'
import type { Register } from '@tanstack/react-router'
import type { RequestHandler } from '@tanstack/react-start/server'
import { api } from './server/api/index'
import type { Env } from './server/api/index'

const startHandler = createStartHandler(defaultStreamHandler) as RequestHandler<Register>

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // Route all /api/* requests to the Hono app.
    // Hono receives the CF env so c.env.DB and c.env.ANTHROPIC_API_KEY are available.
    if (url.pathname.startsWith('/api/')) {
      return api.fetch(request, env, ctx)
    }

    // Everything else is handled by TanStack Start (React SSR).
    return startHandler(request, {})
  },
}
