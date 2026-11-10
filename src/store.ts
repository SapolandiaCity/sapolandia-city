import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile } from '@/types'
import { MISSING_CONFIG, isSupabaseConfigured, supabase } from '@/lib/supabase'
import { fetchFavorites, toggleFavorite } from '@/services/api'

/* ---------------- auth ---------------- */
interface AuthState {
  profile: Profile | null
  userId: string | null
  loading: boolean
  initialized: boolean
  init: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string, fullName: string) => Promise<{ needsConfirmation: boolean }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  updateProfile: (patch: Partial<Pick<Profile, 'username' | 'full_name' | 'avatar_url'>>) => Promise<void>
}

async function loadProfile(id: string): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
  return (data as Profile) ?? null
}

export const useAuthStore = create<AuthState>((set, get) => ({
  profile: null,
  userId: null,
  loading: false,
  initialized: false,

  init: async () => {
    if (!isSupabaseConfigured) return set({ initialized: true })
    const { data } = await supabase.auth.getSession()
    const user = data.session?.user ?? null
    set({ userId: user?.id ?? null, profile: user ? await loadProfile(user.id) : null, initialized: true })
    supabase.auth.onAuthStateChange(async (_e, session) => {
      const u = session?.user ?? null
      set({ userId: u?.id ?? null, profile: u ? await loadProfile(u.id) : null })
    })
  },

  signIn: async (email, password) => {
    if (!isSupabaseConfigured) throw new Error(MISSING_CONFIG)
    set({ loading: true })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    set({ loading: false })
    if (error) throw error
    set({ userId: data.user?.id ?? null, profile: data.user ? await loadProfile(data.user.id) : null })
  },

  signUp: async (email, password, username, fullName) => {
    if (!isSupabaseConfigured) throw new Error(MISSING_CONFIG)
    set({ loading: true })
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { username, full_name: fullName } },
    })
    set({ loading: false })
    if (error) throw error
    return { needsConfirmation: !data.session }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ profile: null, userId: null })
  },

  resetPassword: async (email) => {
    if (!isSupabaseConfigured) throw new Error(MISSING_CONFIG)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    })
    if (error) throw error
  },

  updatePassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  },

  updateProfile: async (patch) => {
    const id = get().userId
    if (!id) throw new Error('Sessão expirada.')
    const { data, error } = await supabase.from('profiles').update(patch).eq('id', id).select().single()
    if (error) throw error
    set({ profile: data as Profile })
  },
}))

export const useIsAdmin = () => useAuthStore((s) => s.profile?.role === 'admin')

/* ---------------- fichas ---------------- */
interface FichasState { balance: number; add: (n: number) => void; take: (n: number) => boolean; reset: () => void }

export const useFichas = create<FichasState>()(
  persist(
    (set, get) => ({
      balance: 1000,
      add: (n) => set({ balance: Math.max(0, Math.round(get().balance + n)) }),
      take: (n) => {
        if (n <= 0 || get().balance < n) return false
        set({ balance: get().balance - n })
        return true
      },
      reset: () => set({ balance: 1000 }),
    }),
    { name: 'sapolandia:fichas' },
  ),
)

/* ---------------- favoritos ---------------- */
interface FavState {
  slugs: string[]
  load: () => Promise<void>
  toggle: (slug: string) => Promise<void>
  isFavorite: (slug: string) => boolean
}

export const useFavorites = create<FavState>()(
  persist(
    (set, get) => ({
      slugs: [],
      load: async () => {
        if (!useAuthStore.getState().userId) return
        set({ slugs: await fetchFavorites() })
      },
      toggle: async (slug) => {
        const isFav = get().slugs.includes(slug)
        set({ slugs: isFav ? get().slugs.filter((s) => s !== slug) : [...get().slugs, slug] })
        try { await toggleFavorite(slug, isFav) } catch { /* offline: mantém local */ }
      },
      isFavorite: (slug) => get().slugs.includes(slug),
    }),
    { name: 'sapolandia:favorites' },
  ),
)
