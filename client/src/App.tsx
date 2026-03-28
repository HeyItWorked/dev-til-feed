import { useState, useEffect } from 'react'
import FeedPage from './pages/FeedPage'
import EntryPage from './pages/EntryPage'
import EditorPage from './pages/EditorPage'

function parseHash(): { page: string; id?: string } {
  const hash = window.location.hash.slice(1) || '/'
  const newMatch = hash.match(/^\/new$/)
  if (newMatch) return { page: 'new' }
  const editMatch = hash.match(/^\/entry\/([^/]+)\/edit$/)
  if (editMatch) return { page: 'edit', id: editMatch[1] }
  const entryMatch = hash.match(/^\/entry\/([^/]+)$/)
  if (entryMatch) return { page: 'entry', id: entryMatch[1] }
  return { page: 'feed' }
}

export default function App() {
  const [route, setRoute] = useState(parseHash)

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <div className="app">
      {route.page === 'feed' && <FeedPage />}
      {route.page === 'entry' && route.id && <EntryPage id={route.id} />}
      {route.page === 'new' && <EditorPage />}
      {route.page === 'edit' && route.id && <EditorPage id={route.id} />}
    </div>
  )
}
