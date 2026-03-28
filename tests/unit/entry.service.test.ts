import { describe, it, expect, beforeEach } from 'vitest'
import { EntryService } from '../../src/services/entry.service.js'
import { NotFoundError } from '../../src/errors.js'
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

  describe('getById', () => {
    it('should return entry when found', async () => {
      const mockEntry = {
        id: 'entry-1',
        title: 'Found',
        body: 'Body',
        tags: ['ts'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      ;(entryRepo.findById as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(mockEntry)

      const result = await service.getById('entry-1')

      expect(entryRepo.findById).toHaveBeenCalledWith('entry-1')
      expect(result).toEqual(mockEntry)
    })

    it('should throw NotFoundError when not found', async () => {
      ;(entryRepo.findById as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(null)

      await expect(service.getById('missing')).rejects.toThrow(NotFoundError)
    })
  })

  describe('list', () => {
    it('should return paginated entries', async () => {
      const mockResult = {
        data: [{ id: 'e1', title: 'T', body: 'B', tags: [], createdAt: 1, updatedAt: 1 }],
        meta: { total: 1, page: 1, pageSize: 10 },
      }

      ;(entryRepo.findMany as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(mockResult)

      const result = await service.list({ page: 1, pageSize: 10 })

      expect(entryRepo.findMany).toHaveBeenCalledWith({ page: 1, pageSize: 10 })
      expect(result).toEqual(mockResult)
    })

    it('should pass search filter to repo', async () => {
      const mockResult = { data: [], meta: { total: 0, page: 1, pageSize: 10 } }
      ;(entryRepo.findMany as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(mockResult)

      await service.list({ q: 'vitest', page: 1, pageSize: 10 })

      expect(entryRepo.findMany).toHaveBeenCalledWith({ q: 'vitest', page: 1, pageSize: 10 })
    })

    it('should pass tag filter to repo', async () => {
      const mockResult = { data: [], meta: { total: 0, page: 1, pageSize: 10 } }
      ;(entryRepo.findMany as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(mockResult)

      await service.list({ tag: 'typescript', page: 1, pageSize: 10 })

      expect(entryRepo.findMany).toHaveBeenCalledWith({ tag: 'typescript', page: 1, pageSize: 10 })
    })
  })

  describe('update', () => {
    it('should update an entry', async () => {
      const existing = { id: 'e1', title: 'Old', body: 'Old', tags: ['old'], createdAt: 1, updatedAt: 1 }
      const input = { title: 'New', body: 'New body', tags: ['new-tag'] }
      const newTags = [{ id: 'tag-new', name: 'new-tag', count: 1 }]
      const updated = { ...existing, ...input, updatedAt: 2 }

      ;(entryRepo.findById as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(existing)
      ;(tagRepo.upsertMany as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(newTags)
      ;(entryRepo.update as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(updated)

      const result = await service.update('e1', input)

      expect(entryRepo.findById).toHaveBeenCalledWith('e1')
      expect(tagRepo.upsertMany).toHaveBeenCalledWith(['new-tag'])
      expect(entryRepo.update).toHaveBeenCalledWith('e1', input)
      expect(tagRepo.syncEntryTags).toHaveBeenCalledWith('e1', ['tag-new'])
      expect(tagRepo.pruneOrphans).toHaveBeenCalled()
      expect(result).toEqual(updated)
    })

    it('should throw NotFoundError when updating missing entry', async () => {
      ;(entryRepo.findById as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(null)

      await expect(service.update('missing', { title: 'X', body: 'X', tags: [] })).rejects.toThrow(NotFoundError)
    })
  })

  describe('delete', () => {
    it('should delete an entry and prune orphans', async () => {
      const existing = { id: 'e1', title: 'T', body: 'B', tags: [], createdAt: 1, updatedAt: 1 }
      ;(entryRepo.findById as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(existing)

      await service.delete('e1')

      expect(entryRepo.findById).toHaveBeenCalledWith('e1')
      expect(entryRepo.delete).toHaveBeenCalledWith('e1')
      expect(tagRepo.pruneOrphans).toHaveBeenCalled()
    })

    it('should throw NotFoundError when deleting missing entry', async () => {
      ;(entryRepo.findById as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(null)

      await expect(service.delete('missing')).rejects.toThrow(NotFoundError)
    })
  })
})
