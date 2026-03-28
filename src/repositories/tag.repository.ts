import type { Tag } from './types.js'

export interface TagRepository {
  upsertMany(names: string[]): Promise<Tag[]>
  syncEntryTags(entryId: string, tagIds: string[]): Promise<void>
  listWithCount(): Promise<Tag[]>
  pruneOrphans(): Promise<void>
}
