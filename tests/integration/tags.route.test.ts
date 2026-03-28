import { describe, it, expect, beforeEach } from 'vitest'
import { createApp } from '../../src/index.js'
import { mockEntryRepo } from '../mocks/entry.repo.mock.js'
import { mockTagRepo } from '../mocks/tag.repo.mock.js'
import type { EntryRepository } from '../../src/repositories/entry.repository.js'
import type { TagRepository } from '../../src/repositories/tag.repository.js'

describe('Tag routes', () => {
  let entryRepo: EntryRepository
  let tagRepo: TagRepository
  let app: ReturnType<typeof createApp>

  beforeEach(() => {
    entryRepo = mockEntryRepo()
    tagRepo = mockTagRepo()
    app = createApp({ entryRepo, tagRepo })
  })

  describe('GET /api/tags', () => {
    it('should return 200 with tags', async () => {
      const mockTags = [
        { id: 't1', name: 'typescript', count: 5 },
        { id: 't2', name: 'testing', count: 3 },
      ]
      ;(tagRepo.listWithCount as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(mockTags)

      const res = await app.request('/api/tags')

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data).toEqual(mockTags)
    })

    it('should return 200 with empty array', async () => {
      ;(tagRepo.listWithCount as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue([])

      const res = await app.request('/api/tags')

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data).toEqual([])
    })
  })
})
