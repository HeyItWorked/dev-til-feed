import { useState, useEffect } from 'react'
import { listEntries } from '../api/entries'
import { listTags } from '../api/tags'
import type { Entry, Tag, PaginatedMeta } from '../api/types'
import EntryCard from '../components/EntryCard'
import TagCloud from '../components/TagCloud'
import SearchBar from '../components/SearchBar'
import Pagination from '../components/Pagination'

export default function FeedPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [meta, setMeta] = useState<PaginatedMeta>({ total: 0, page: 1, pageSize: 10 })
  const [tags, setTags] = useState<Tag[]>([])
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | undefined>(() => {
    const match = window.location.hash.match(/[?&]tag=([^&]+)/)
    return match ? decodeURIComponent(match[1]) : undefined
  })
  const [page, setPage] = useState(1)

  useEffect(() => {
    document.title = 'Dev TIL Feed'
    listTags().then((res) => setTags(res.data)).catch(console.error)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      listEntries({ q: search || undefined, tag: activeTag, page, pageSize: 10 })
        .then((res) => { setEntries(res.data); setMeta(res.meta) })
        .catch(console.error)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, activeTag, page])

  const handleTagClick = (tag: string) => {
    setActiveTag(activeTag === tag ? undefined : tag)
    setPage(1)
  }

  return (
    <div>
      <div className="feed-header">
        <h1>Dev TIL Feed</h1>
        <a href="#/new" className="btn-primary" style={{ textDecoration: 'none' }}>New TIL</a>
      </div>
      <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
      {tags.length > 0 && (
        <TagCloud tags={tags} activeTag={activeTag} onTagClick={handleTagClick} />
      )}
      {entries.length === 0 ? (
        <p className="empty-state">
          {search || activeTag ? 'No results found.' : 'No entries yet. Write your first TIL!'}
        </p>
      ) : (
        entries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            onTagClick={handleTagClick}
            onClick={() => { window.location.hash = `/entry/${entry.id}` }}
          />
        ))
      )}
      <Pagination page={meta.page} pageSize={meta.pageSize} total={meta.total} onPageChange={setPage} />
    </div>
  )
}
