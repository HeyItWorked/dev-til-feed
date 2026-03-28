import { vi } from 'vitest'
import type { TagRepository } from '../../src/repositories/tag.repository.js'

export const mockTagRepo = (): TagRepository => ({
  upsertMany: vi.fn(),
  syncEntryTags: vi.fn(),
  listWithCount: vi.fn(),
  pruneOrphans: vi.fn(),
})
