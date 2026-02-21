import { Hono } from 'hono'
import type { DbClient } from '../db'

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

api.get('/health', (c) => c.json({ status: 'ok' }))

export type ApiType = typeof api
