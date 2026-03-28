export type Entry = {
  id: string
  title: string
  body: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

export type Tag = {
  id: string
  name: string
  count: number
}

export type PaginatedMeta = {
  total: number
  page: number
  pageSize: number
}

export type CreateEntryInput = {
  title: string
  body: string
  tags: string[]
}

export type UpdateEntryInput = CreateEntryInput
