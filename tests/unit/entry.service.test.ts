import { describe, it, expect, beforeEach } from 'vitest'
import { EntryService } from '../../src/services/entry.service.js'
import { mockEntryRepo } from '../mocks/entry.repo.mock.js'
import { mockTagRepo } from '../mocks/tag.repo.mock.js'
import type { EntryRepository } from '../../src/repositories/entry.repository.js'
import type { TagRepository } from '../../src/repositories/tag.repository.js'

describe('EntryService', () => {
  let service: EntryService
  let entryRepo: EntryRepository
  let tagRepo: TagRepository

  beforeEach(() => {
    entryRepo = mockEntryRepo()
    tagRepo = mockTagRepo()
    service = new EntryService(entryRepo, tagRepo)
  })

  describe('create', () => {
    it('should create an entry with tags', async () => {
      const input = { title: 'Test TIL', body: 'Learned something', tags: ['typescript', 'testing'] }
      const mockTags = [
        { id: 'tag-1', name: 'typescript', count: 1 },
        { id: 'tag-2', name: 'testing', count: 1 },
      ]
      const mockEntry = {
        id: 'entry-1',
        title: 'Test TIL',
        body: 'Learned something',
        tags: ['typescript', 'testing'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      ;(tagRepo.upsertMany as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(mockTags)
      ;(entryRepo.create as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(mockEntry)

      const result = await service.create(input)

      expect(tagRepo.upsertMany).toHaveBeenCalledWith(['typescript', 'testing'])
      expect(entryRepo.create).toHaveBeenCalledWith(input)
      expect(tagRepo.syncEntryTags).toHaveBeenCalledWith('entry-1', ['tag-1', 'tag-2'])
      expect(result).toEqual(mockEntry)
    })

    it('should create an entry with empty tags', async () => {
      const input = { title: 'No tags', body: 'Just text', tags: [] as string[] }
      const mockEntry = {
        id: 'entry-2',
        title: 'No tags',
        body: 'Just text',
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      ;(tagRepo.upsertMany as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue([])
      ;(entryRepo.create as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(mockEntry)

      const result = await service.create(input)

      expect(tagRepo.upsertMany).toHaveBeenCalledWith([])
      expect(entryRepo.create).toHaveBeenCalledWith(input)
      expect(tagRepo.syncEntryTags).toHaveBeenCalledWith('entry-2', [])
      expect(result).toEqual(mockEntry)
    })
  })
})
