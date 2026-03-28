import { useState, useRef } from 'react'
import type { CreateEntryInput } from '../api/types'
import Markdown from './Markdown'

type Props = {
  initial?: CreateEntryInput
  onSubmit: (data: CreateEntryInput) => void
  submitLabel?: string
}

function autoCapitalize(value: string): string {
  if (value.length === 1) return value.charAt(0).toUpperCase()
  return value
}

type ToolbarAction = { label: string; icon: string; before: string; after: string; block?: boolean }

const toolbarActions: ToolbarAction[] = [
  { label: 'Bold', icon: 'B', before: '**', after: '**' },
  { label: 'Italic', icon: 'I', before: '*', after: '*' },
  { label: 'Code', icon: '<>', before: '`', after: '`' },
  { label: 'Code Block', icon: '{}', before: '```\n', after: '\n```', block: true },
  { label: 'Heading', icon: 'H', before: '## ', after: '' },
  { label: 'List', icon: '•', before: '- ', after: '' },
  { label: 'Link', icon: '🔗', before: '[', after: '](url)' },
]

export default function EditorForm({ initial, onSubmit, submitLabel = 'Save' }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [tagsInput, setTagsInput] = useState(initial?.tags.join(', ') ?? '')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleTitleChange = (value: string) => {
    setTitle(autoCapitalize(value))
  }

  const handleToolbar = (action: ToolbarAction) => {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = body.slice(start, end)
    const replacement = action.before + (selected || 'text') + action.after
    const newBody = body.slice(0, start) + replacement + body.slice(end)
    setBody(newBody)
    requestAnimationFrame(() => {
      ta.focus()
      const cursorPos = start + action.before.length + (selected || 'text').length
      ta.setSelectionRange(cursorPos, cursorPos)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const newBody = body.slice(0, start) + '  ' + body.slice(end)
      setBody(newBody)
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2
      })
    }
    if (e.key === 'Enter') {
      const start = ta.selectionStart
      const lineStart = body.lastIndexOf('\n', start - 1) + 1
      const currentLine = body.slice(lineStart, start)
      const listMatch = currentLine.match(/^(\s*[-*]\s)/)
      if (listMatch) {
        if (currentLine.trim() === '-' || currentLine.trim() === '*') {
          e.preventDefault()
          const newBody = body.slice(0, lineStart) + '\n' + body.slice(start)
          setBody(newBody)
          requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = lineStart + 1
          })
        } else {
          e.preventDefault()
          const prefix = listMatch[1]
          const newBody = body.slice(0, start) + '\n' + prefix + body.slice(start)
          setBody(newBody)
          requestAnimationFrame(() => {
            const pos = start + 1 + prefix.length
            ta.selectionStart = ta.selectionEnd = pos
          })
        }
      }
    }
  }

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
        <input id="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} required />
      </div>
      <div className="editor-form__field">
        <label htmlFor="body">Body (Markdown)</label>
        <div className="editor-toolbar">
          {toolbarActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="editor-toolbar__btn"
              title={action.label}
              onClick={() => handleToolbar(action)}
            >
              {action.icon}
            </button>
          ))}
        </div>
        <textarea
          id="body"
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={12}
          required
        />
        {body && (
          <div className="editor-preview">
            <div className="editor-preview__label">Preview</div>
            <Markdown>{body}</Markdown>
          </div>
        )}
      </div>
      <div className="editor-form__field">
        <label htmlFor="tags">Tags (comma separated)</label>
        <input id="tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
      </div>
      <button type="submit" className="btn-primary">{submitLabel}</button>
    </form>
  )
}
