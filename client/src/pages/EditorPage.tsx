import { useState, useEffect, useCallback } from 'react'
import { createEntry, updateEntry, getEntry } from '../api/entries'
import type { CreateEntryInput, Entry } from '../api/types'
import EditorForm from '../components/EditorForm'

type Props = { id?: string }

export default function EditorPage({ id }: Props) {
  const [initial, setInitial] = useState<CreateEntryInput | undefined>()
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState('')
  const [dirty, setDirty] = useState(false)
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)

  useEffect(() => {
    document.title = id ? 'Edit TIL — Dev TIL' : 'New TIL — Dev TIL'
    if (!id) return
    getEntry(id)
      .then((res: { data: Entry }) => {
        setInitial({ title: res.data.title, body: res.data.body, tags: res.data.tags })
        setLoading(false)
      })
      .catch((err: Error) => { setError(err.message); setLoading(false) })
  }, [id])

  const handleSubmit = async (data: CreateEntryInput) => {
    try {
      if (id) {
        await updateEntry(id, data)
        window.location.hash = `/entry/${id}`
      } else {
        const res = await createEntry(data)
        window.location.hash = `/entry/${res.data.id}`
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    }
  }

  const cancelHref = id ? `#/entry/${id}` : '#/'

  const handleCancel = (e: React.MouseEvent) => {
    if (dirty) {
      e.preventDefault()
      setShowUnsavedWarning(true)
    }
  }

  const handleDirtyChange = useCallback((d: boolean) => {
    setDirty(d)
    if (!d) setShowUnsavedWarning(false)
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <div className="editor-page">
      <a href={cancelHref} className="back-link" onClick={handleCancel}>Cancel</a>
      {showUnsavedWarning && (
        <div className="unsaved-warning">
          <span>You have unsaved changes.</span>
          <a href={cancelHref} className="btn-danger" style={{ textDecoration: 'none' }}>Discard</a>
          <button type="button" className="btn-secondary" onClick={() => setShowUnsavedWarning(false)}>Keep editing</button>
        </div>
      )}
      <h1>{id ? 'Edit TIL' : 'New TIL'}</h1>
      {error && <p className="error-text">{error}</p>}
      <EditorForm
        initial={initial}
        onSubmit={handleSubmit}
        onDirtyChange={handleDirtyChange}
        submitLabel={id ? 'Update' : 'Create'}
      />
    </div>
  )
}
