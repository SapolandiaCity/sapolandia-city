import { useCallback, useState } from 'react'
import type { GameResult, HistoryItem } from '@/types'
import { randomId } from '@/lib/utils'
import { recordSession } from '@/services/api'

const LIMIT = 12

function read(key: string): HistoryItem[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as HistoryItem[]) : []
  } catch { return [] }
}

export function useGameHistory(slug: string) {
  const key = `sapolandia:history:${slug}`
  const [items, setItems] = useState<HistoryItem[]>(() => read(key))

  const push = useCallback((label: string, result: GameResult, delta: number) => {
    const item: HistoryItem = { id: randomId(), label, result, delta, at: new Date().toISOString() }
    setItems((prev) => {
      const next = [item, ...prev].slice(0, LIMIT)
      try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* cota */ }
      return next
    })
    void recordSession(slug, result, delta)
  }, [key, slug])

  const clear = useCallback(() => {
    localStorage.removeItem(key)
    setItems([])
  }, [key])

  return { items, push, clear }
}
