import type { Entry, CreateEntryInput, UpdateEntryInput, PaginatedMeta } from './types'

type ListParams = {
  q?: string
  tag?: string
  page?: number
  pageSize?: number
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export async function listEntries(params: ListParams = {}): Promise<{ data: Entry[]; meta: PaginatedMeta }> {
  const query = new URLSearchParams()
  if (params.q) query.set('q', params.q)
  if (params.tag) query.set('tag', params.tag)
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))
  const qs = query.toString()
  return request(`/api/entries${qs ? `?${qs}` : ''}`)
}

export async function getEntry(id: string): Promise<{ data: Entry }> {
  return request(`/api/entries/${id}`)
}

export async function createEntry(input: CreateEntryInput): Promise<{ data: Entry }> {
  return request('/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export async function updateEntry(id: string, input: UpdateEntryInput): Promise<{ data: Entry }> {
  return request(`/api/entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
}

export async function deleteEntry(id: string): Promise<void> {
  return request(`/api/entries/${id}`, { method: 'DELETE' })
}
