import { useState, useEffect } from 'react'
import { getEntry, deleteEntry } from '../api/entries'
import type { Entry } from '../api/types'
import Markdown from '../components/Markdown'

type Props = { id: string }

export default function EntryPage({ id }: Props) {
  const [entry, setEntry] = useState<Entry | null>(null)
  const [error, setError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    getEntry(id)
      .then((res) => setEntry(res.data))
      .catch((err) => setError(err.message))
  }, [id])

  const handleDelete = async () => {
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
      <div className="entry-page__body"><Markdown>{entry.body}</Markdown></div>
      <div className="entry-page__actions">
        <a href={`#/entry/${id}/edit`} className="btn-secondary" style={{ textDecoration: 'none' }}>Edit</a>
        {confirmDelete ? (
          <>
            <span className="confirm-label">Delete this entry?</span>
            <button className="btn-danger" onClick={handleDelete}>Yes</button>
            <button className="btn-secondary" onClick={() => setConfirmDelete(false)}>No</button>
          </>
        ) : (
          <button className="btn-danger" onClick={() => setConfirmDelete(true)}>Delete</button>
        )}
      </div>
    </article>
  )
}
