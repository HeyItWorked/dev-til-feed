import type { EntryRepository } from '../repositories/entry.repository.js'
import type { TagRepository } from '../repositories/tag.repository.js'
import type { CreateEntryInput, Entry } from '../repositories/types.js'

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
}
