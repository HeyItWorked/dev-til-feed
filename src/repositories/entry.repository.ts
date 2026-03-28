import type { CreateEntryInput, UpdateEntryInput, EntryFilters, Entry, PaginatedResult } from './types.js'

export interface EntryRepository {
  create(input: CreateEntryInput): Promise<Entry>
  findMany(filters: EntryFilters): Promise<PaginatedResult<Entry>>
  findById(id: string): Promise<Entry | null>
  update(id: string, input: UpdateEntryInput): Promise<Entry>
  delete(id: string): Promise<void>
}
