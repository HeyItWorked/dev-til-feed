import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core'

export const entries = sqliteTable('entries', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'number' }).notNull(),
})

export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
})

export const entryTags = sqliteTable('entry_tags', {
  entryId: text('entry_id').notNull().references(() => entries.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.entryId, table.tagId] }),
])
