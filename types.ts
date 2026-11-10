export type Role = 'user' | 'admin'
export type TicketStatus = 'open' | 'pending' | 'closed'
export type GameResult = 'win' | 'loss' | 'draw'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  role: Role
  created_at: string
}

export interface Category { id: string; slug: string; name: string; icon: string | null; sort_order: number }

export interface Game {
  id: string
  slug: string
  title: string
  description: string | null
  category_id: string | null
  cover_url: string | null
  active: boolean
  featured: boolean
  sort_order: number
  plays: number
  categories?: { slug: string; name: string } | null
}

export interface Ticket {
  id: string
  user_id: string | null
  name: string
  email: string
  subject: string
  message: string
  status: TicketStatus
  created_at: string
}

export interface Banner {
  id: string
  title: string
  subtitle: string | null
  image_url: string | null
  link_url: string | null
  active: boolean
  sort_order: number
}

export interface AuditLog { id: number; actor_email: string | null; action: string; entity: string | null; created_at: string }

export interface HistoryItem { id: string; label: string; result: GameResult; delta: number; at: string }

export type PlayFn = (label: string, result: GameResult, delta: number) => void
export interface GameProps { play: PlayFn }
