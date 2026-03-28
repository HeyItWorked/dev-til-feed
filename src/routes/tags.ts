import { Hono } from 'hono'
import type { TagService } from '../services/tag.service.js'

export function createTagRoutes(tagService: TagService) {
  const app = new Hono()

  app.get('/', async (c) => {
    const tags = await tagService.listAll()
    return c.json({ data: tags })
  })

  return app
}
