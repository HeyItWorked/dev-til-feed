import type { EntryRepository } from '../repositories/entry.repository.js'
import type { TagRepository } from '../repositories/tag.repository.js'
import type { CreateEntryInput, Entry, EntryFilters, PaginatedResult } from '../repositories/types.js'
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
}
