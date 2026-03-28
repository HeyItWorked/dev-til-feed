export type Entry = {
  id: string
  title: string
  body: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

export type CreateEntryInput = {
  title: string
  body: string
  tags: string[]
}

export type UpdateEntryInput = CreateEntryInput

export type EntryFilters = {
  q?: string
  tag?: string
  page?: number
  pageSize?: number
}

export type PaginatedResult<T> = {
  data: T[]
  meta: { total: number; page: number; pageSize: number }
}

export type Tag = {
  id: string
  name: string
  count: number
}
