import { useState, useEffect } from 'react'
import { createEntry, updateEntry, getEntry } from '../api/entries'
import type { CreateEntryInput, Entry } from '../api/types'
import EditorForm from '../components/EditorForm'

type Props = { id?: string }

export default function EditorPage({ id }: Props) {
  const [initial, setInitial] = useState<CreateEntryInput | undefined>()
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState('')

  useEffect(() => {
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

  if (loading) return <p>Loading...</p>

  return (
    <div className="editor-page">
      <a href={id ? `#/entry/${id}` : '#/'} className="back-link">Cancel</a>
      <h1>{id ? 'Edit TIL' : 'New TIL'}</h1>
      {error && <p className="error-text">{error}</p>}
      <EditorForm
        initial={initial}
        onSubmit={handleSubmit}
        submitLabel={id ? 'Update' : 'Create'}
      />
    </div>
  )
}
