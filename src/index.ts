import { Hono } from 'hono'
import type { EntryRepository } from './repositories/entry.repository.js'
import type { TagRepository } from './repositories/tag.repository.js'
import { EntryService } from './services/entry.service.js'
import { TagService } from './services/tag.service.js'
import { createEntryRoutes } from './routes/entries.js'
import { createTagRoutes } from './routes/tags.js'
import { AppError } from './errors.js'

type AppDeps = {
  entryRepo: EntryRepository
  tagRepo: TagRepository
}

export function createApp({ entryRepo, tagRepo }: AppDeps) {
  const app = new Hono()

  const entryService = new EntryService(entryRepo, tagRepo)
  const tagService = new TagService(tagRepo)

  app.route('/api/entries', createEntryRoutes(entryService))
  app.route('/api/tags', createTagRoutes(tagService))

  app.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json({ error: err.message, code: err.code }, err.statusCode as 400)
    }
    return c.json({ error: 'Internal server error', code: 'INTERNAL_ERROR' }, 500)
  })

  return app
}
