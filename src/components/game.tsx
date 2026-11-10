import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Coins, Heart, RotateCcw, Trash2 } from 'lucide-react'
import { Button, Spinner } from './ui'
import { useFichas, useFavorites } from '@/store'
import { useGameHistory } from '@/hooks'
import { cn } from '@/lib/utils'
import type { Game } from '@/types'
import type { GameMeta } from '@/lib/games'

const accents: Record<string, string> = {
  coelho: 'from-emerald-500/30 to-emerald-900/10',
  rato: 'from-amber-400/25 to-amber-900/10',
  touro: 'from-orange-500/25 to-red-900/10',
  tigre: 'from-yellow-500/25 to-orange-900/10',
  dragao: 'from-rose-500/25 to-red-900/10',
  roleta: 'from-cyan-400/25 to-blue-900/10',
  slots: 'from-fuchsia-500/25 to-purple-900/10',
  crash: 'from-brand/25 to-navy-600/20',
}

export function GameCard({ game, favorite, onToggleFavorite }: { game: Game; favorite?: boolean; onToggleFavorite?: (slug: string) => void }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-ink-900 card-hover">
      <Link to={`/jogos/${game.slug}`}>
        <div className={cn('relative aspect-[4/3] bg-gradient-to-br p-4', accents[game.slug] ?? 'from-white/10 to-transparent')}>
          <div className="absolute inset-0 grid-bg opacity-70" />
          <span className="relative z-10 rounded-full bg-black/40 px-2.5 py-1 text-[11px] uppercase tracking-wide text-slate-300">{game.categories?.name ?? 'Jogo'}</span>
          {game.featured && <span className="absolute bottom-3 left-4 rounded-md bg-gold px-2 py-0.5 text-[10px] font-bold text-ink-950">DESTAQUE</span>}
        </div>
      </Link>
      <div className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          <Link to={`/jogos/${game.slug}`} className="block truncate font-semibold hover:text-brand-300">{game.title}</Link>
          <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{game.description}</p>
        </div>
        {onToggleFavorite && (
          <button onClick={() => onToggleFavorite(game.slug)} aria-label="Favoritar" className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5 text-slate-400 hover:text-brand-300', favorite && 'text-brand')}>
            <Heart size={16} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
    </div>
  )
}

export function GameShell({ meta, children }: { meta: GameMeta; children: (api: { play: (l: string, r: 'win' | 'loss' | 'draw', d: number) => void }) => React.ReactNode }) {
  const navigate = useNavigate()
  const balance = useFichas((s) => s.balance)
  const reset = useFichas((s) => s.reset)
  const { items, push, clear } = useGameHistory(meta.slug)
  const { isFavorite, toggle } = useFavorites()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 400)
    return () => clearTimeout(t)
  }, [meta.slug])

  return (
    <div className="container-app py-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft size={16} /> Voltar</Button>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold">
            <Coins size={14} /> {balance.toLocaleString('pt-BR')}
          </span>
          <Button variant="ghost" size="sm" onClick={() => void toggle(meta.slug)} aria-label="Favoritar">
            <Heart size={16} className={cn(isFavorite(meta.slug) && 'text-brand')} fill={isFavorite(meta.slug) ? 'currentColor' : 'none'} />
          </Button>
          <Button variant="ghost" size="sm" onClick={reset} aria-label="Repor fichas"><RotateCcw size={16} /></Button>
        </div>
      </div>

      <header className="mb-6">
        <h1 className="text-2xl font-extrabold sm:text-3xl">{meta.title}</h1>
        <p className="mt-1 text-sm text-slate-400">{meta.description}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="glass p-4 sm:p-6">{ready ? children({ play: push }) : <Spinner label="Preparando o jogo" />}</section>
        <aside className="glass h-fit p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Histórico local</h2>
            {items.length > 0 && <button onClick={clear} className="text-slate-400 hover:text-red-300"><Trash2 size={14} /></button>}
          </div>
          {items.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-500">Nenhuma rodada ainda.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((h) => (
                <li key={h.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-xs">
                  <span className="truncate text-slate-300">{h.label}</span>
                  <span className={cn('font-semibold', h.delta > 0 ? 'text-brand' : h.delta < 0 ? 'text-red-400' : 'text-slate-400')}>
                    {h.delta > 0 ? '+' : ''}{h.delta}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 text-[11px] leading-relaxed text-slate-500">Fichas virtuais de diversão. Sem depósito nem saque.</p>
        </aside>
      </div>
    </div>
  )
}
