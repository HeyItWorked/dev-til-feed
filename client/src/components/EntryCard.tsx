import type { Entry } from '../api/types'

type Props = {
  entry: Entry
  onTagClick?: (tag: string) => void
  onClick?: () => void
}

export default function EntryCard({ entry, onTagClick, onClick }: Props) {
  const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <article className="entry-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <h2 className="entry-card__title">{entry.title}</h2>
      <p className="entry-card__body">{entry.body}</p>
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
