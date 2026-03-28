import { vi } from 'vitest'
import type { EntryRepository } from '../../src/repositories/entry.repository.js'

export const mockEntryRepo = (): EntryRepository => ({
  create: vi.fn(),
  findMany: vi.fn(),
  findById: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
})
