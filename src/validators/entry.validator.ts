import { z } from 'zod'

export const createEntrySchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  tags: z.array(z.string().min(1).max(30).toLowerCase().trim()).max(10),
})

export const updateEntrySchema = createEntrySchema

export const listEntriesQuerySchema = z.object({
  q: z.string().optional(),
  tag: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
})
