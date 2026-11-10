import { useEffect, useState } from 'react'
import { Badge, Button, Card, Input, Spinner, Textarea } from '@/components/ui'
import { formatDateTime } from '@/lib/utils'
import type { AuditLog, Banner, Category, Game, Profile, Ticket, TicketStatus } from '@/types'
import {
  deleteBanner, deleteCategory, fetchAllGames, fetchBanners, fetchCategories, fetchLogs, fetchSettings,
  fetchStats, fetchTickets, fetchUsers, saveBanner, saveCategory, saveSetting, setTicketStatus, setUserRole, updateGame,
} from '@/services/api'

export function Dashboard() {
  const [stats, setStats] = useState<{ users: number; sessions: number; openTickets: number; games: number } | null>(null)

  useEffect(() => { void fetchStats().then(setStats).catch(() => setStats({ users: 0, sessions: 0, openTickets: 0, games: 0 })) }, [])

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-400">Visão geral da plataforma.</p>
      {!stats ? <Spinner /> : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[['Usuários', stats.users], ['Sessões', stats.sessions], ['Chamados abertos', stats.openTickets], ['Jogos', stats.games]].map(([l, v]) => (
            <Card key={String(l)}>
              <p className="text-xs uppercase tracking-wide text-slate-400">{l}</p>
              <p className="mt-2 font-display text-3xl font-extrabold text-gold">{v}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export function Users() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => fetchUsers().then(setUsers).finally(() => setLoading(false))
  useEffect(() => { void load() }, [])

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Usuários</h1>
      <p className="mt-1 text-sm text-slate-400">Altere permissões com cautela.</p>
      {loading ? <Spinner /> : (
        <div className="mt-6 space-y-2">
          {users.map((u) => (
            <div key={u.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{u.full_name ?? u.username}</p>
                <p className="truncate text-xs text-slate-400">@{u.username} · {formatDateTime(u.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={u.role === 'admin' ? 'warn' : 'neutral'}>{u.role}</Badge>
                <Button size="sm" variant="outline" onClick={async () => { await setUserRole(u.id, u.role === 'admin' ? 'user' : 'admin'); void load() }}>
                  {u.role === 'admin' ? 'Rebaixar' : 'Promover'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function GamesAdmin() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => fetchAllGames().then(setGames).finally(() => setLoading(false))
  useEffect(() => { void load() }, [])

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Jogos</h1>
      <p className="mt-1 text-sm text-slate-400">Ative, destaque e ordene os jogos do catálogo.</p>
      {loading ? <Spinner /> : (
        <div className="mt-6 space-y-2">
          {games.map((g) => (
            <div key={g.id} className="glass flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium">{g.title}</p>
                <p className="text-xs text-slate-400">{g.slug} · {g.categories?.name ?? 'sem categoria'} · {g.plays} jogadas</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant={g.active ? 'primary' : 'outline'} onClick={async () => { await updateGame(g.id, { active: !g.active }); void load() }}>
                  {g.active ? 'Ativo' : 'Inativo'}
                </Button>
                <Button size="sm" variant={g.featured ? 'gold' : 'ghost'} onClick={async () => { await updateGame(g.id, { featured: !g.featured }); void load() }}>
                  Destaque
                </Button>
                <Button size="sm" variant="ghost" onClick={async () => { await updateGame(g.id, { sort_order: g.sort_order - 1 }); void load() }}>↑</Button>
                <Button size="sm" variant="ghost" onClick={async () => { await updateGame(g.id, { sort_order: g.sort_order + 1 }); void load() }}>↓</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function Categories() {
  const [items, setItems] = useState<Category[]>([])
  const [form, setForm] = useState({ name: '', slug: '' })

  const load = () => fetchCategories().then(setItems)
  useEffect(() => { void load() }, [])

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Categorias</h1>
      <div className="glass mt-5 flex flex-wrap items-end gap-2 p-4">
        <Input placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="max-w-[200px]" />
        <Input placeholder="slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="max-w-[160px]" />
        <Button onClick={async () => { if (!form.name || !form.slug) return; await saveCategory(form); setForm({ name: '', slug: '' }); void load() }}>Adicionar</Button>
      </div>
      <div className="mt-4 space-y-2">
        {items.map((c) => (
          <div key={c.id} className="glass flex items-center justify-between p-4">
            <p className="text-sm">{c.name} <span className="text-xs text-slate-500">/{c.slug}</span></p>
            <Button size="sm" variant="danger" onClick={async () => { await deleteCategory(c.id); void load() }}>Excluir</Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Banners() {
  const [items, setItems] = useState<Banner[]>([])
  const [form, setForm] = useState({ title: '', subtitle: '', link_url: '' })

  const load = () => fetchBanners().then(setItems)
  useEffect(() => { void load() }, [])

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Banners</h1>
      <div className="glass mt-5 space-y-2 p-4">
        <Input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input placeholder="Subtítulo" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
        <Input placeholder="Link (ex: /jogos/crash)" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} />
        <Button onClick={async () => { if (!form.title) return; await saveBanner(form); setForm({ title: '', subtitle: '', link_url: '' }); void load() }}>Adicionar</Button>
      </div>
      <div className="mt-4 space-y-2">
        {items.map((b) => (
          <div key={b.id} className="glass flex items-center justify-between p-4">
            <div><p className="text-sm">{b.title}</p><p className="text-xs text-slate-400">{b.subtitle}</p></div>
            <Button size="sm" variant="danger" onClick={async () => { await deleteBanner(b.id); void load() }}>Excluir</Button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Tickets() {
  const [items, setItems] = useState<Ticket[]>([])

  const load = () => fetchTickets().then(setItems)
  useEffect(() => { void load() }, [])

  const change = async (id: string, status: TicketStatus) => { await setTicketStatus(id, status); void load() }

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Chamados</h1>
      <div className="mt-5 space-y-3">
        {items.map((t) => (
          <div key={t.id} className="glass p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{t.subject}</p>
              <Badge tone={t.status === 'open' ? 'warn' : t.status === 'closed' ? 'success' : 'neutral'}>{t.status}</Badge>
            </div>
            <p className="mt-1 text-xs text-slate-400">{t.name} · {t.email} · {formatDateTime(t.created_at)}</p>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-300">{t.message}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => void change(t.id, 'pending')}>Pendente</Button>
              <Button size="sm" onClick={() => void change(t.id, 'closed')}>Encerrar</Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-500">Nenhum chamado.</p>}
      </div>
    </div>
  )
}

export function SettingsPage() {
  const [general, setGeneral] = useState<Record<string, string>>({ siteName: '', tagline: '', supportEmail: '' })
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    void fetchSettings().then((s) => {
      const g = (s.general ?? {}) as Record<string, string>
      setGeneral({ siteName: g.siteName ?? '', tagline: g.tagline ?? '', supportEmail: g.supportEmail ?? '' })
    })
  }, [])

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold">Configurações</h1>
      <div className="glass mt-5 space-y-3 p-5">
        <Input placeholder="Nome do site" value={general.siteName} onChange={(e) => setGeneral({ ...general, siteName: e.target.value })} />
        <Input placeholder="Tagline" value={general.tagline} onChange={(e) => setGeneral({ ...general, tagline: e.target.value })} />
        <Input placeholder="E-mail de suporte" value={general.supportEmail} onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })} />
        <Textarea rows={3} readOnly value={'As fichas são virtuais. Nenhum pagamento é processado nesta versão.'} />
        <Button onClick={async () => { await saveSetting('general', general); setMsg('Salvo.') }}>Salvar</Button>
        {msg && <p className="text-xs text-brand-300">{msg}</p>}
      </div>
    </div>
  )
}

export function Logs() {
  const [items, setItems] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { void fetchLogs().then(setItems).finally(() => setLoading(false)) }, [])

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Logs de auditoria</h1>
      {loading ? <Spinner /> : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr><th className="py-2">Data</th><th>Ação</th><th>Entidade</th><th>Ator</th></tr>
            </thead>
            <tbody>
              {items.map((l) => (
                <tr key={l.id} className="border-t border-white/5">
                  <td className="py-2 text-xs text-slate-400">{formatDateTime(l.created_at)}</td>
                  <td className="text-xs">{l.action}</td>
                  <td className="text-xs text-slate-400">{l.entity}</td>
                  <td className="text-xs text-slate-400">{l.actor_email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="py-6 text-sm text-slate-500">Nenhum registro.</p>}
        </div>
      )}
    </div>
  )
}
