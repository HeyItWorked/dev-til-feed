import { useState, useEffect } from 'react'
import { getEntry, deleteEntry } from '../api/entries'
import type { Entry } from '../api/types'

type Props = { id: string }

export default function EntryPage({ id }: Props) {
  const [entry, setEntry] = useState<Entry | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getEntry(id)
      .then((res) => setEntry(res.data))
      .catch((err) => setError(err.message))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this entry?')) return
    await deleteEntry(id)
    window.location.hash = '/'
  }

  if (error) return <p className="error-text">{error}</p>
  if (!entry) return <p>Loading...</p>

  const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <article className="entry-page">
      <a href="#/" className="back-link">Back to feed</a>
      <h1>{entry.title}</h1>
      <time className="entry-page__date">{date}</time>
      <div className="entry-page__tags">
        {entry.tags.map((tag) => (
          <span key={tag} className="tag-pill">{tag}</span>
        ))}
      </div>
      <div className="entry-page__body">{entry.body}</div>
      <div className="entry-page__actions">
        <a href={`#/entry/${id}/edit`} className="btn-secondary" style={{ textDecoration: 'none' }}>Edit</a>
        <button className="btn-danger" onClick={handleDelete}>Delete</button>
      </div>
    </article>
  )
}
