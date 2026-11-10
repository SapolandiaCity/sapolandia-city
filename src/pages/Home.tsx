import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Coins, Gift, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { Button, SectionTitle } from '@/components/ui'
import { GameCard } from '@/components/game'
import { GAME_LIST } from '@/lib/games'
import { useAuthStore, useFavorites } from '@/store'
import type { Game } from '@/types'

function toGame(slug: string, category: string, featured = false): Game {
  const m = GAME_LIST.find((g) => g.slug === slug)!
  return { id: slug, slug, title: m.title, description: m.description, category_id: null, cover_url: null, active: true, featured, sort_order: 0, plays: 0, categories: { slug: category, name: category } }
}

export default function Home() {
  const profile = useAuthStore((s) => s.profile)
  const { slugs, toggle, load } = useFavorites()
  const [recent, setRecent] = useState<Game[]>([])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    try {
      const raw = localStorage.getItem('sapolandia:recent-games')
      const list: string[] = raw ? JSON.parse(raw) : []
      setRecent(list.map((s) => { const m = GAME_LIST.find((g) => g.slug === s); return m ? toGame(m.slug, m.category) : null }).filter(Boolean) as Game[])
    } catch { setRecent([]) }
  }, [])

  return (
    <>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 grid-bg" />
        <div className="container-app relative grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand-300">
              <Sparkles size={14} /> Plataforma 100% gratuita
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
              Entre na <span className="grad-text">Sapolandia</span> e jogue sem carteira.
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-400">
              Slots, crash, roleta, cartas e jogos de animais com identidade própria. Fichas virtuais, nenhum depósito, nenhum saque.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/jogos"><Button size="lg">Explorar jogos <ArrowRight size={18} /></Button></Link>
              {!profile && <Link to="/cadastrar"><Button size="lg" variant="outline">Criar conta grátis</Button></Link>}
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 text-center">
              {[['8', 'jogos originais'], ['7', 'categorias'], ['0', 'reais investidos']].map(([k, v]) => (
                <div key={v} className="glass px-2 py-4">
                  <dt className="font-display text-2xl font-extrabold text-gold">{k}</dt>
                  <dd className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative">
            <div className="glass grid aspect-[4/3] place-items-center overflow-hidden bg-gradient-to-br from-brand/15 via-ink-900 to-navy-600/30">
              <img src="/logo.svg" alt="" className="h-32 w-32 animate-float drop-shadow-2xl" />
            </div>
            <div className="glass absolute -bottom-5 left-4 flex items-center gap-3 px-4 py-3 animate-float">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand/15 text-brand"><Coins size={18} /></span>
              <div><p className="text-xs text-slate-400">Fichas iniciais</p><p className="text-sm font-bold">1.000 grátis</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-app py-14">
        <SectionTitle title="Destaques da semana" subtitle="Selecionados pela equipe" action={<Link to="/jogos" className="text-sm text-brand-300">Ver tudo</Link>} />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {GAME_LIST.slice(0, 4).map((g) => <GameCard key={g.slug} game={toGame(g.slug, g.category, true)} favorite={slugs.includes(g.slug)} onToggleFavorite={toggle} />)}
        </div>
      </section>

      <section className="container-app pb-14">
        <SectionTitle title="Categorias" subtitle="Escolha o estilo da sessão" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {['slots', 'arcade', 'crash', 'roleta', 'cartas', 'rapidos', 'animais'].map((c) => (
            <Link key={c} to={`/jogos?categoria=${c}`} className="glass card-hover px-4 py-6 text-center text-sm capitalize">{c}</Link>
          ))}
        </div>
      </section>

      <section className="container-app pb-14">
        <SectionTitle title="Populares" subtitle="Os mais jogados" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {['crash', 'roleta', 'slots', 'dragao'].map((s) => <GameCard key={s} game={toGame(s, 'populares')} favorite={slugs.includes(s)} onToggleFavorite={toggle} />)}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="container-app pb-14">
          <SectionTitle title="Jogados recentemente" subtitle="Continue de onde parou" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {recent.slice(0, 4).map((g) => <GameCard key={g.slug} game={g} favorite={slugs.includes(g.slug)} onToggleFavorite={toggle} />)}
          </div>
        </section>
      )}

      <section className="container-app pb-20">
        <div className="glass grid gap-6 p-6 sm:grid-cols-3 sm:p-8">
          {[
            { icon: Gift, t: 'Fichas gratuitas', d: '1.000 fichas ao entrar e reposição quando quiser.' },
            { icon: ShieldCheck, t: 'Conta segura', d: 'Autenticação real com confirmação de e-mail.' },
            { icon: Zap, t: 'Feito para celular', d: 'Interface touch, carregamento rápido, navegação inferior.' },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t}>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand"><Icon size={20} /></span>
              <h3 className="mt-3 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-slate-400">{d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
