import { eq, sql, inArray } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import type { Db } from '../db/client.js'
import { tags, entryTags } from '../db/schema.js'
import type { TagRepository } from './tag.repository.js'
import type { Tag } from './types.js'

export class SqliteTagRepository implements TagRepository {
  constructor(private db: Db) {}

  async upsertMany(names: string[]): Promise<Tag[]> {
    if (names.length === 0) return []

    const existing = this.db
      .select()
      .from(tags)
      .where(inArray(tags.name, names))
      .all()

    const existingNames = new Set(existing.map((t) => t.name))
    const toCreate = names.filter((n) => !existingNames.has(n))

    for (const name of toCreate) {
      this.db.insert(tags).values({ id: nanoid(), name }).run()
    }

    const all = this.db
      .select()
      .from(tags)
      .where(inArray(tags.name, names))
      .all()

    return all.map((t) => ({ ...t, count: 0 }))
  }

  async syncEntryTags(entryId: string, tagIds: string[]): Promise<void> {
    this.db.delete(entryTags).where(eq(entryTags.entryId, entryId)).run()

    for (const tagId of tagIds) {
      this.db.insert(entryTags).values({ entryId, tagId }).run()
    }
  }

  async listWithCount(): Promise<Tag[]> {
    const rows = this.db
      .select({
        id: tags.id,
        name: tags.name,
        count: sql<number>`count(${entryTags.entryId})`,
      })
      .from(tags)
      .leftJoin(entryTags, eq(tags.id, entryTags.tagId))
      .groupBy(tags.id, tags.name)
      .all()

    return rows
  }

  async pruneOrphans(): Promise<void> {
    const usedTagIds = this.db
      .selectDistinct({ tagId: entryTags.tagId })
      .from(entryTags)

    this.db.delete(tags).where(
      sql`${tags.id} NOT IN (${usedTagIds})`
    ).run()
  }
}
