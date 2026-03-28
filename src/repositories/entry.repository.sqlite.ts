import { eq, like, or, sql, and, inArray } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import type { Db } from '../db/client.js'
import { entries, entryTags, tags } from '../db/schema.js'
import type { EntryRepository } from './entry.repository.js'
import type { CreateEntryInput, UpdateEntryInput, Entry, EntryFilters, PaginatedResult } from './types.js'

export class SqliteEntryRepository implements EntryRepository {
  constructor(private db: Db) {}

  private async attachTags(entryId: string): Promise<string[]> {
    const rows = this.db
      .select({ name: tags.name })
      .from(entryTags)
      .innerJoin(tags, eq(entryTags.tagId, tags.id))
      .where(eq(entryTags.entryId, entryId))
      .all()
    return rows.map((r) => r.name)
  }

  async create(input: CreateEntryInput): Promise<Entry> {
    const now = Date.now()
    const id = nanoid()
    this.db.insert(entries).values({
      id,
      title: input.title,
      body: input.body,
      createdAt: now,
      updatedAt: now,
    }).run()
    const tagNames = await this.attachTags(id)
    return { id, title: input.title, body: input.body, tags: tagNames, createdAt: now, updatedAt: now }
  }

  async findMany(filters: EntryFilters): Promise<PaginatedResult<Entry>> {
    const page = filters.page ?? 1
    const pageSize = filters.pageSize ?? 10
    const offset = (page - 1) * pageSize

    const conditions = []

    if (filters.q) {
      const pattern = `%${filters.q}%`
      conditions.push(or(like(entries.title, pattern), like(entries.body, pattern)))
    }

    if (filters.tag) {
      const entryIdsWithTag = this.db
        .select({ entryId: entryTags.entryId })
        .from(entryTags)
        .innerJoin(tags, eq(entryTags.tagId, tags.id))
        .where(eq(tags.name, filters.tag))
      conditions.push(inArray(entries.id, entryIdsWithTag))
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const countResult = this.db
      .select({ count: sql<number>`count(*)` })
      .from(entries)
      .where(where)
      .get()
    const total = countResult?.count ?? 0

    const rows = this.db
      .select()
      .from(entries)
      .where(where)
      .orderBy(sql`${entries.createdAt} desc`)
      .limit(pageSize)
      .offset(offset)
      .all()

    const data: Entry[] = []
    for (const row of rows) {
      const tagNames = await this.attachTags(row.id)
      data.push({ ...row, tags: tagNames })
    }

    return { data, meta: { total, page, pageSize } }
  }

  async findById(id: string): Promise<Entry | null> {
    const row = this.db.select().from(entries).where(eq(entries.id, id)).get()
    if (!row) return null
    const tagNames = await this.attachTags(id)
    return { ...row, tags: tagNames }
  }

  async update(id: string, input: UpdateEntryInput): Promise<Entry> {
    const now = Date.now()
    this.db.update(entries).set({
      title: input.title,
      body: input.body,
      updatedAt: now,
    }).where(eq(entries.id, id)).run()
    const row = this.db.select().from(entries).where(eq(entries.id, id)).get()!
    const tagNames = await this.attachTags(id)
    return { ...row, tags: tagNames }
  }

  async delete(id: string): Promise<void> {
    this.db.delete(entries).where(eq(entries.id, id)).run()
  }
}
