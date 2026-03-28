import { Hono } from 'hono'
import { createEntrySchema, updateEntrySchema, listEntriesQuerySchema } from '../validators/entry.validator.js'
import { ValidationError } from '../errors.js'
import type { EntryService } from '../services/entry.service.js'

export function createEntryRoutes(entryService: EntryService) {
  const app = new Hono()

  app.post('/', async (c) => {
    const body = await c.req.json()
    const parsed = createEntrySchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message)
    }
    const entry = await entryService.create(parsed.data)
    return c.json({ data: entry }, 201)
  })

  app.get('/', async (c) => {
    const query = {
      q: c.req.query('q'),
      tag: c.req.query('tag'),
      page: c.req.query('page'),
      pageSize: c.req.query('pageSize'),
    }
    const parsed = listEntriesQuerySchema.safeParse(query)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message)
    }
    const result = await entryService.list(parsed.data)
    const truncated = result.data.map((e) => ({
      ...e,
      body: e.body.length > 200 ? e.body.slice(0, 200) : e.body,
    }))
    return c.json({ data: truncated, meta: result.meta })
  })

  app.get('/:id', async (c) => {
    const entry = await entryService.getById(c.req.param('id'))
    return c.json({ data: entry })
  })

  app.put('/:id', async (c) => {
    const body = await c.req.json()
    const parsed = updateEntrySchema.safeParse(body)
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues[0].message)
    }
    const entry = await entryService.update(c.req.param('id'), parsed.data)
    return c.json({ data: entry })
  })

  app.delete('/:id', async (c) => {
    await entryService.delete(c.req.param('id'))
    return c.body(null, 204)
  })

  return app
}
