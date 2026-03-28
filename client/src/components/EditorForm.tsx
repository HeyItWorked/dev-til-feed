import { useState } from 'react'
import type { CreateEntryInput } from '../api/types'

type Props = {
  initial?: CreateEntryInput
  onSubmit: (data: CreateEntryInput) => void
  submitLabel?: string
}

export default function EditorForm({ initial, onSubmit, submitLabel = 'Save' }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [tagsInput, setTagsInput] = useState(initial?.tags.join(', ') ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
    onSubmit({ title, body, tags })
  }

  return (
    <form className="editor-form" onSubmit={handleSubmit}>
      <div className="editor-form__field">
        <label htmlFor="title">Title</label>
        <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="editor-form__field">
        <label htmlFor="body">Body</label>
        <textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} rows={8} required />
      </div>
      <div className="editor-form__field">
        <label htmlFor="tags">Tags (comma separated)</label>
        <input id="tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
      </div>
      <button type="submit" className="btn-primary">{submitLabel}</button>
    </form>
  )
}
