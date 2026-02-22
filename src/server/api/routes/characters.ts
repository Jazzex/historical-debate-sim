import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import type { HonoContext } from '../index'
import { characters } from '../../db/schema'

export const charactersRoutes = new Hono<HonoContext>()

// GET /api/characters?tags=philosophy&era=Ancient+Greece
charactersRoutes.get('/', async (c) => {
  const db = c.get('db')
  const tagRaw = c.req.query('tags')
  const eraRaw = c.req.query('era')
  if ((tagRaw && tagRaw.length > 100) || (eraRaw && eraRaw.length > 100)) {
    return c.json({ error: 'filter parameter too long' }, 400)
  }
  const tagFilter = tagRaw?.toLowerCase()
  const eraFilter = eraRaw?.toLowerCase()

  const rows = await db.select().from(characters)

  const filtered = rows.filter((char) => {
    if (tagFilter && !(char.tags as string[]).some((t) => t.toLowerCase().includes(tagFilter))) {
      return false
    }
    if (eraFilter && !char.era.toLowerCase().includes(eraFilter)) {
      return false
    }
    return true
  })

  return c.json(filtered)
})

// GET /api/characters/:id
charactersRoutes.get('/:id', async (c) => {
  const db = c.get('db')
  const id = c.req.param('id')

  const rows = await db.select().from(characters).where(eq(characters.id, id))
  if (!rows[0]) return c.json({ error: 'Character not found' }, 404)

  return c.json(rows[0])
})
