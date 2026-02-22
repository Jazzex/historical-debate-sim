import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { getDb, type DbClient } from '../db'
import { charactersRoutes } from './routes/characters'
import { debatesRoutes } from './routes/debates'
import { turnRoutes } from './routes/turn'

export type Env = {
  DB: D1Database
  ANTHROPIC_API_KEY: string
}

export type HonoContext = {
  Bindings: Env
  Variables: {
    db: DbClient
  }
}

export const api = new Hono<HonoContext>().basePath('/api')

// CORS — only allow requests from the same workers.dev origin
api.use('*', cors({
  origin: 'https://grand-council.2weimerj2011.workers.dev',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
}))

// Inject the Drizzle DB client from Cloudflare D1 bindings
api.use('*', async (c, next) => {
  c.set('db', getDb(c.env.DB))
  await next()
})

api.get('/health', (c) => c.json({ status: 'ok' }))

// Sub-routers
api.route('/characters', charactersRoutes)
api.route('/debates', debatesRoutes)
api.route('/debate', turnRoutes) // → /api/debate/turn (SSE)

export type ApiType = typeof api
