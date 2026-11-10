export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

export function initials(name?: string | null) {
  if (!name) return 'SP'
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('')
}

export const randomId = () => Math.random().toString(36).slice(2, 10)
export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n))
