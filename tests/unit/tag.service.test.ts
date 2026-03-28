import { describe, it, expect, beforeEach } from 'vitest'
import { TagService } from '../../src/services/tag.service.js'
import { mockTagRepo } from '../mocks/tag.repo.mock.js'
import type { TagRepository } from '../../src/repositories/tag.repository.js'

describe('TagService', () => {
  let service: TagService
  let tagRepo: TagRepository

  beforeEach(() => {
    tagRepo = mockTagRepo()
    service = new TagService(tagRepo)
  })

  describe('listAll', () => {
    it('should return all tags with counts', async () => {
      const mockTags = [
        { id: 't1', name: 'typescript', count: 5 },
        { id: 't2', name: 'testing', count: 3 },
      ]
      ;(tagRepo.listWithCount as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(mockTags)

      const result = await service.listAll()

      expect(tagRepo.listWithCount).toHaveBeenCalled()
      expect(result).toEqual(mockTags)
    })

    it('should return empty array when no tags', async () => {
      ;(tagRepo.listWithCount as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue([])

      const result = await service.listAll()

      expect(result).toEqual([])
    })
  })
})
