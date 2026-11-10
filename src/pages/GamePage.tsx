import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { GameShell } from '@/components/game'
import { GAME_REGISTRY } from '@/lib/games'
import { bumpPlays } from '@/services/api'

export default function GamePage() {
  const { slug = '' } = useParams()
  const meta = GAME_REGISTRY[slug]

  useEffect(() => {
    if (!meta) return
    document.title = `${meta.title} · Sapolandia Play`
    try {
      const raw = localStorage.getItem('sapolandia:recent-games')
      const list: string[] = raw ? JSON.parse(raw) : []
      localStorage.setItem('sapolandia:recent-games', JSON.stringify([slug, ...list.filter((s) => s !== slug)].slice(0, 8)))
    } catch { /* ignora */ }
    void bumpPlays(slug)
    return () => { document.title = 'Sapolandia Play' }
  }, [meta, slug])

  if (!meta) return <Navigate to="/jogos" replace />
  const Game = meta.component
  return <GameShell meta={meta}>{(api) => <Game play={api.play} />}</GameShell>
}
