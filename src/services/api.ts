import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import type { AuditLog, Banner, Category, Game, GameResult, Profile, Ticket, TicketStatus } from '@/types'

export async function fetchGames(): Promise<Game[]> {
  if (!isSupabaseConfigured) return []
  const { data, error } = await supabase.from('games').select('*, categories(slug, name)').eq('active', true).order('sort_order')
  if (error) throw error
  return (data ?? []) as Game[]
}

export async function fetchAllGames(): Promise<Game[]> {
  const { data, error } = await supabase.from('games').select('*, categories(slug, name)').order('sort_order')
  if (error) throw error
  return (data ?? []) as Game[]
}

export async function updateGame(id: string, patch: Partial<Game>) {
  const { error } = await supabase.from('games').update(patch).eq('id', id)
  if (error) throw error
}

export async function fetchFavorites(): Promise<string[]> {
  if (!isSupabaseConfigured) return []
  const { data } = await supabase.from('favorites').select('game_id')
  return (data ?? []).map((r) => r.game_id as string)
}

export async function toggleFavorite(gameId: string, isFav: boolean) {
  if (!isSupabaseConfigured) return
  const { error } = isFav
    ? await supabase.from('favorites').delete().eq('game_id', gameId)
    : await supabase.from('favorites').insert({ game_id: gameId })
  if (error) throw error
}

export async function recordSession(gameSlug: string, result: GameResult, score: number) {
  if (!isSupabaseConfigured) return
  const { data } = await supabase.auth.getSession()
  const userId = data.session?.user.id
  if (!userId) return
  await supabase.from('game_sessions').insert({ user_id: userId, game_slug: gameSlug, result, score })
}

export async function bumpPlays(slug: string) {
  if (!isSupabaseConfigured) return
  try { await supabase.rpc('bump_game_plays', { game_slug: slug }) } catch { /* ignora */ }
}

/* -------- suporte -------- */
export async function createTicket(p: { name: string; email: string; subject: string; message: string }) {
  const { data } = await supabase.auth.getSession()
  const { error } = await supabase.from('support_tickets').insert({ ...p, user_id: data.session?.user.id ?? null })
  if (error) throw error
}

export async function fetchMyTickets(): Promise<Ticket[]> {
  if (!isSupabaseConfigured) return []
  const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false })
  return (data ?? []) as Ticket[]
}

/* -------- admin -------- */
export async function logAction(action: string, entity: string, entityId?: string, metadata?: object) {
  const { data } = await supabase.auth.getSession()
  const user = data.session?.user
  if (!user) return
  await supabase.from('audit_logs').insert({ actor_id: user.id, actor_email: user.email, action, entity, entity_id: entityId ?? null, metadata: metadata ?? null })
}

export async function fetchStats() {
  const [u, s, t, g] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('game_sessions').select('id', { count: 'exact', head: true }),
    supabase.from('support_tickets').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('games').select('id', { count: 'exact', head: true }),
  ])
  return { users: u.count ?? 0, sessions: s.count ?? 0, openTickets: t.count ?? 0, games: g.count ?? 0 }
}

export async function fetchUsers(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Profile[]
}

export async function setUserRole(id: string, role: 'user' | 'admin') {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
  if (error) throw error
  await logAction('role_changed', 'profile', id, { role })
}

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('sort_order')
  if (error) throw error
  return (data ?? []) as Category[]
}

export async function saveCategory(p: Partial<Category> & { name: string; slug: string }) {
  const { error } = p.id
    ? await supabase.from('categories').update(p).eq('id', p.id)
    : await supabase.from('categories').insert(p)
  if (error) throw error
  await logAction(p.id ? 'category_updated' : 'category_created', 'category', p.id)
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
  await logAction('category_deleted', 'category', id)
}

export async function fetchBanners(): Promise<Banner[]> {
  const { data, error } = await supabase.from('banners').select('*').order('sort_order')
  if (error) throw error
  return (data ?? []) as Banner[]
}

export async function saveBanner(p: Partial<Banner> & { title: string }) {
  const { error } = p.id
    ? await supabase.from('banners').update(p).eq('id', p.id)
    : await supabase.from('banners').insert(p)
  if (error) throw error
  await logAction(p.id ? 'banner_updated' : 'banner_created', 'banner', p.id)
}

export async function deleteBanner(id: string) {
  const { error } = await supabase.from('banners').delete().eq('id', id)
  if (error) throw error
  await logAction('banner_deleted', 'banner', id)
}

export async function fetchTickets(): Promise<Ticket[]> {
  const { data, error } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Ticket[]
}

export async function setTicketStatus(id: string, status: TicketStatus) {
  const { error } = await supabase.from('support_tickets').update({ status }).eq('id', id)
  if (error) throw error
  await logAction('ticket_status', 'ticket', id, { status })
}

export async function fetchLogs(): Promise<AuditLog[]> {
  const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200)
  if (error) throw error
  return (data ?? []) as AuditLog[]
}

export async function fetchSettings(): Promise<Record<string, unknown>> {
  const { data, error } = await supabase.from('site_settings').select('*')
  if (error) throw error
  return Object.fromEntries((data ?? []).map((r) => [r.key as string, r.value]))
}

export async function saveSetting(key: string, value: unknown) {
  const { error } = await supabase.from('site_settings').upsert({ key, value, updated_at: new Date().toISOString() })
  if (error) throw error
  await logAction('setting_saved', 'site_settings', key)
}
