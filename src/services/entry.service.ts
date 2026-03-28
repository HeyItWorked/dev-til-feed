import type { EntryRepository } from '../repositories/entry.repository.js'
import type { TagRepository } from '../repositories/tag.repository.js'
import type { CreateEntryInput, UpdateEntryInput, Entry, EntryFilters, PaginatedResult } from '../repositories/types.js'
import { NotFoundError } from '../errors.js'

export class EntryService {
  constructor(
    private entryRepo: EntryRepository,
    private tagRepo: TagRepository,
  ) {}

  async create(input: CreateEntryInput): Promise<Entry> {
    const tags = await this.tagRepo.upsertMany(input.tags)
    const entry = await this.entryRepo.create(input)
    await this.tagRepo.syncEntryTags(entry.id, tags.map((t) => t.id))
    return entry
  }

  async getById(id: string): Promise<Entry> {
    const entry = await this.entryRepo.findById(id)
    if (!entry) throw new NotFoundError('Entry')
    return entry
  }

  async list(filters: EntryFilters): Promise<PaginatedResult<Entry>> {
    return this.entryRepo.findMany(filters)
  }

  async update(id: string, input: UpdateEntryInput): Promise<Entry> {
    const existing = await this.entryRepo.findById(id)
    if (!existing) throw new NotFoundError('Entry')
    const tags = await this.tagRepo.upsertMany(input.tags)
    const entry = await this.entryRepo.update(id, input)
    await this.tagRepo.syncEntryTags(id, tags.map((t) => t.id))
    await this.tagRepo.pruneOrphans()
    return entry
  }

  async delete(id: string): Promise<void> {
    const existing = await this.entryRepo.findById(id)
    if (!existing) throw new NotFoundError('Entry')
    await this.entryRepo.delete(id)
    await this.tagRepo.pruneOrphans()
  }
}
