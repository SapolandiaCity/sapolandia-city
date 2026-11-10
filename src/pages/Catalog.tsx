import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Heart, Search } from 'lucide-react'
import { GameCard } from '@/components/game'
import { EmptyState, Input } from '@/components/ui'
import { GAME_LIST } from '@/lib/games'
import { useFavorites } from '@/store'
import { cn } from '@/lib/utils'
import type { Game } from '@/types'

const categories = ['todos', 'slots', 'arcade', 'crash', 'roleta', 'cartas', 'rapidos', 'animais']

function toGame(slug: string, category: string): Game {
  const m = GAME_LIST.find((g) => g.slug === slug)!
  return { id: slug, slug, title: m.title, description: m.description, category_id: null, cover_url: null, active: true, featured: false, sort_order: 0, plays: 0, categories: { slug: category, name: category } }
}

export function Games() {
  const [params, setParams] = useSearchParams()
  const active = params.get('categoria') ?? 'todos'
  const [query, setQuery] = useState('')
  const { slugs, toggle } = useFavorites()

  const games = useMemo(
    () => GAME_LIST.filter((g) => active === 'todos' || g.category === active)
      .filter((g) => g.title.toLowerCase().includes(query.toLowerCase()))
      .map((g) => toGame(g.slug, g.category)),
    [active, query],
  )

  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-extrabold">Biblioteca de jogos</h1>
      <p className="mt-1 text-sm text-slate-400">{GAME_LIST.length} jogos originais, todos gratuitos.</p>
      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button key={c} onClick={() => setParams(c === 'todos' ? {} : { categoria: c })}
              className={cn('shrink-0 rounded-full border border-white/10 px-4 py-2 text-xs capitalize text-slate-300', active === c && 'border-brand bg-brand/10 text-brand-300')}>
              {c}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar jogo" className="pl-9" />
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {games.map((g) => <GameCard key={g.slug} game={g} favorite={slugs.includes(g.slug)} onToggleFavorite={toggle} />)}
      </div>
      {games.length === 0 && <p className="py-16 text-center text-sm text-slate-500">Nenhum jogo encontrado.</p>}
    </div>
  )
}

export function Favorites() {
  const { slugs, toggle, load } = useFavorites()
  useEffect(() => { void load() }, [load])

  const games = GAME_LIST.filter((g) => slugs.includes(g.slug)).map((g) => toGame(g.slug, g.category))

  return (
    <div className="container-app py-10">
      <h1 className="text-3xl font-extrabold">Favoritos</h1>
      <p className="mt-1 text-sm text-slate-400">Jogos salvos neste dispositivo e na sua conta.</p>
      <div className="mt-8">
        {games.length === 0
          ? <EmptyState title="Nenhum favorito ainda" description="Toque no coração de um jogo para salvá-lo." icon={<Heart size={28} />} />
          : <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{games.map((g) => <GameCard key={g.slug} game={g} favorite onToggleFavorite={toggle} />)}</div>}
      </div>
    </div>
  )
}
