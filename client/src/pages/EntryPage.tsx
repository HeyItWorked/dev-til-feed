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
      .then((res) => {
        setEntry(res.data)
        document.title = `${res.data.title} — Dev TIL`
      })
      .catch((err) => {
        setError(err.message)
        document.title = 'Not Found — Dev TIL'
      })
  }, [id])

  const handleDelete = async () => {
    await deleteEntry(id)
    window.location.hash = '/'
  }

  if (error) return (
    <div className="not-found">
      <h2>Entry not found</h2>
      <p>This entry may have been deleted or the link is incorrect.</p>
      <a href="#/" className="btn-primary" style={{ textDecoration: 'none' }}>Back to feed</a>
    </div>
  )
  if (!entry) return <p>Loading...</p>

  const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
  const wasEdited = entry.updatedAt - entry.createdAt > 1000

  return (
    <article className="entry-page">
      <a href="#/" className="back-link">Back to feed</a>
      <h1>{entry.title}</h1>
      <time className="entry-page__date">{date}{wasEdited && ' (edited)'}</time>
      <div className="entry-page__tags">
        {entry.tags.map((tag) => (
          <span
            key={tag}
            className="tag-pill"
            onClick={() => { window.location.hash = `/?tag=${tag}` }}
          >
            {tag}
          </span>
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
