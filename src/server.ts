import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { createDb } from './db/client.js'
import { SqliteEntryRepository } from './repositories/entry.repository.sqlite.js'
import { SqliteTagRepository } from './repositories/tag.repository.sqlite.js'
import { createApp } from './index.js'

const dbPath = process.env.DB_PATH ?? './data/til.db'
const port = Number(process.env.PORT ?? 3000)

const db = createDb(dbPath)
const entryRepo = new SqliteEntryRepository(db)
const tagRepo = new SqliteTagRepository(db)
const app = createApp({ entryRepo, tagRepo })

app.use('/*', serveStatic({ root: './client/dist' }))
app.get('*', serveStatic({ root: './client/dist', path: 'index.html' }))

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`TIL Feed running on http://localhost:${info.port}`)
})
