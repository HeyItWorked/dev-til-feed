import type { Tag } from '../api/types'

type Props = {
  tags: Tag[]
  activeTag?: string
  onTagClick: (tag: string) => void
}

export default function TagCloud({ tags, activeTag, onTagClick }: Props) {
  return (
    <div className="tag-cloud">
      {tags.map((tag) => (
        <span
          key={tag.id}
          className={`tag-pill ${activeTag === tag.name ? 'tag-pill--active' : ''}`}
          onClick={() => onTagClick(tag.name)}
        >
          {tag.name} <span className="tag-pill__count">{tag.count}</span>
        </span>
      ))}
    </div>
  )
}
