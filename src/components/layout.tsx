import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, Coins, FolderTree, Gamepad2, Heart, Home, Image, LayoutDashboard, LifeBuoy, LogIn, Menu, ScrollText, Settings, User, Users, X } from 'lucide-react'
import { Button } from './ui'
import { useAuthStore, useFichas } from '@/store'
import { cn } from '@/lib/utils'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Sapolandia Play — início">
      <img src="/logo.svg" alt="" className="h-10 w-10 rounded-xl ring-1 ring-gold/40 transition group-hover:ring-gold" />
      {!compact && (
        <span className="font-display text-lg font-extrabold leading-none">
          <span className="text-white">SAPOLANDIA</span> <span className="text-gold">PLAY</span>
        </span>
      )}
    </Link>
  )
}

const links = [
  { to: '/', label: 'Início' },
  { to: '/jogos', label: 'Jogos' },
  { to: '/jogos?categoria=animais', label: 'Animais' },
  { to: '/jogos?categoria=crash', label: 'Crash' },
  { to: '/suporte', label: 'Suporte' },
]

function Header() {
  const [open, setOpen] = useState(false)
  const profile = useAuthStore((s) => s.profile)
  const balance = useFichas((s) => s.balance)

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/85 backdrop-blur-xl">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink key={l.label} to={l.to} className={({ isActive }) => cn('rounded-lg px-3 py-2 text-sm text-slate-300 hover:text-white', isActive && 'text-brand-300')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold sm:flex">
            <Coins size={14} /> {balance.toLocaleString('pt-BR')} fichas
          </span>
          {profile ? (
            <>
              {profile.role === 'admin' && (
                <Link to="/admin" className="hidden sm:block"><Button variant="ghost" size="sm"><LayoutDashboard size={16} /> Admin</Button></Link>
              )}
              <Link to="/perfil"><Button variant="outline" size="sm"><User size={16} /> {profile.username}</Button></Link>
            </>
          ) : (
            <>
              <Link to="/entrar" className="hidden sm:block"><Button variant="ghost" size="sm"><LogIn size={16} /> Entrar</Button></Link>
              <Link to="/cadastrar"><Button size="sm">Criar conta</Button></Link>
            </>
          )}
          <button onClick={() => setOpen((v) => !v)} className="grid h-10 w-10 place-items-center rounded-lg bg-white/5 lg:hidden" aria-label="Menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-ink-950 p-4 lg:hidden">
          {links.map((l) => (
            <Link key={l.label} to={l.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-white/5">{l.label}</Link>
          ))}
          {profile?.role === 'admin' && <Link to="/admin" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm text-gold">Painel admin</Link>}
          {!profile && <Link to="/entrar" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-sm text-brand-300">Entrar</Link>}
        </div>
      )}
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-ink-900/60">
      <div className="container-app grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-slate-400">Jogos gratuitos de entretenimento. Fichas virtuais, sem dinheiro real.</p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Plataforma</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/jogos" className="hover:text-brand-300">Biblioteca de jogos</Link></li>
            <li><Link to="/favoritos" className="hover:text-brand-300">Favoritos</Link></li>
            <li><Link to="/suporte" className="hover:text-brand-300">Atendimento</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Legal</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/termos" className="hover:text-brand-300">Termos de uso</Link></li>
            <li><Link to="/privacidade" className="hover:text-brand-300">Privacidade</Link></li>
            <li><Link to="/jogo-responsavel" className="hover:text-brand-300">Jogo responsável</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Atendimento</h3>
          <p className="text-sm text-slate-400">suporte@sapolandia.play</p>
          <p className="mt-1 text-sm text-slate-400">Seg a sex, 9h às 18h</p>
        </div>
      </div>
      <p className="container-app border-t border-white/5 py-5 text-xs text-slate-500">
        © {new Date().getFullYear()} Sapolandia Play. Conteúdo original.
      </p>
    </footer>
  )
}

const mobileItems = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/jogos', label: 'Jogos', icon: Gamepad2 },
  { to: '/favoritos', label: 'Favoritos', icon: Heart },
  { to: '/suporte', label: 'Suporte', icon: LifeBuoy },
  { to: '/perfil', label: 'Perfil', icon: User },
]

function MobileNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/95 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5">
        {mobileItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => cn('flex flex-col items-center gap-1 py-2.5 text-[11px] text-slate-400', isActive && 'text-brand-300')}>
            <Icon size={20} /> {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export function PublicLayout() {
  const { pathname } = useLocation()
  useEffect(() => window.scrollTo({ top: 0 }), [pathname])
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 pb-20 lg:pb-0"><Outlet /></main>
      <Footer />
      <MobileNav />
    </div>
  )
}

const adminItems = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
  { to: '/admin/jogos', label: 'Jogos', icon: Gamepad2 },
  { to: '/admin/categorias', label: 'Categorias', icon: FolderTree },
  { to: '/admin/banners', label: 'Banners', icon: Image },
  { to: '/admin/chamados', label: 'Chamados', icon: LifeBuoy },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
  { to: '/admin/logs', label: 'Logs', icon: ScrollText },
]

export function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="border-b border-white/10 bg-ink-900 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="p-5"><Logo /></div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-col">
          {adminItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => cn('flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white', isActive && 'bg-brand/10 text-brand-300')}>
              <Icon size={17} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-5 sm:p-8"><Outlet /></main>
    </div>
  )
}
