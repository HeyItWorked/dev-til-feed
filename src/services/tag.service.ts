import type { TagRepository } from '../repositories/tag.repository.js'
import type { Tag } from '../repositories/types.js'

export class TagService {
  constructor(private tagRepo: TagRepository) {}

  async listAll(): Promise<Tag[]> {
    return this.tagRepo.listWithCount()
  }
}
