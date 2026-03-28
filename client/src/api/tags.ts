import type { Tag } from './types'

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(body.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export async function listTags(): Promise<{ data: Tag[] }> {
  return request('/api/tags')
}
