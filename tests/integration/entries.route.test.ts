import { describe, it, expect, beforeEach } from 'vitest'
import { createApp } from '../../src/index.js'
import { mockEntryRepo } from '../mocks/entry.repo.mock.js'
import { mockTagRepo } from '../mocks/tag.repo.mock.js'
import type { EntryRepository } from '../../src/repositories/entry.repository.js'
import type { TagRepository } from '../../src/repositories/tag.repository.js'

describe('Entry routes', () => {
  let entryRepo: EntryRepository
  let tagRepo: TagRepository
  let app: ReturnType<typeof createApp>

  beforeEach(() => {
    entryRepo = mockEntryRepo()
    tagRepo = mockTagRepo()
    app = createApp({ entryRepo, tagRepo })
  })

  describe('POST /api/entries', () => {
    it('should return 201 with created entry', async () => {
      const mockTags = [{ id: 't1', name: 'typescript', count: 1 }]
      const mockEntry = {
        id: 'e1', title: 'TIL', body: 'Learned stuff', tags: ['typescript'],
        createdAt: 1000, updatedAt: 1000,
      }
      ;(tagRepo.upsertMany as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(mockTags)
      ;(entryRepo.create as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(mockEntry)

      const res = await app.request('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'TIL', body: 'Learned stuff', tags: ['typescript'] }),
      })

      expect(res.status).toBe(201)
      const json = await res.json()
      expect(json.data.id).toBe('e1')
    })

    it('should return 400 on validation error', async () => {
      const res = await app.request('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '', body: '' }),
      })

      expect(res.status).toBe(400)
      const json = await res.json()
      expect(json.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('GET /api/entries', () => {
    it('should return 200 with paginated entries', async () => {
      const mockResult = {
        data: [{
          id: 'e1', title: 'TIL', body: 'A'.repeat(300), tags: ['ts'],
          createdAt: 1000, updatedAt: 1000,
        }],
        meta: { total: 1, page: 1, pageSize: 10 },
      }
      ;(entryRepo.findMany as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(mockResult)

      const res = await app.request('/api/entries')

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data[0].body.length).toBe(200)
      expect(json.meta.total).toBe(1)
    })
  })

  describe('GET /api/entries/:id', () => {
    it('should return 200 with full entry', async () => {
      const mockEntry = {
        id: 'e1', title: 'TIL', body: 'Full body', tags: ['ts'],
        createdAt: 1000, updatedAt: 1000,
      }
      ;(entryRepo.findById as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(mockEntry)

      const res = await app.request('/api/entries/e1')

      expect(res.status).toBe(200)
      const json = await res.json()
      expect(json.data.body).toBe('Full body')
    })

    it('should return 404 when not found', async () => {
      ;(entryRepo.findById as ReturnType<typeof import('vitest').vi.fn>).mockResolvedValue(null)

      const res = await app.request('/api/entries/missing')

      expect(res.status).toBe(404)
      const json = await res.json()
      expect(json.code).toBe('NOT_FOUND')
    })
  })
})
