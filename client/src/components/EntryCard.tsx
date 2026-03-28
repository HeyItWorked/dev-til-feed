import type { Entry } from '../api/types'

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?(```|$)/g, '') // fenced code blocks (incl. truncated)
    .replace(/`([^`]*)`/g, '$1')       // inline code
    .replace(/`/g, '')                 // stray backticks
    .replace(/#{1,6}\s+/g, '')         // headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
    .replace(/\*([^*]+)\*/g, '$1')     // italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/\n+/g, ' ')             // newlines to spaces
    .replace(/\s+/g, ' ')             // collapse whitespace
    .trim()
}

type Props = {
  entry: Entry
  onTagClick?: (tag: string) => void
  onClick?: () => void
}

export default function EntryCard({ entry, onTagClick, onClick }: Props) {
  const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
  const preview = stripMarkdown(entry.body)

  return (
    <article className="entry-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <h2 className="entry-card__title">{entry.title}</h2>
      <p className="entry-card__body">{preview}</p>
      <div className="entry-card__footer">
        <div className="entry-card__tags">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="tag-pill"
              onClick={(e) => { e.stopPropagation(); onTagClick?.(tag) }}
            >
              {tag}
            </span>
          ))}
        </div>
        <time className="entry-card__date">{date}</time>
      </div>
    </article>
  )
}
