import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui'
import { useFichas } from '@/store'
import { cn, randomId } from '@/lib/utils'
import type { GameProps } from '@/types'

const CHIPS = [10, 25, 50, 100]

function BetRow({ bet, setBet, disabled }: { bet: number; setBet: (n: number) => void; disabled: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {CHIPS.map((c) => (
        <button key={c} disabled={disabled} onClick={() => setBet(c)}
          className={cn('rounded-lg border border-white/10 px-3 py-1.5 text-xs', bet === c && 'border-brand bg-brand/10 text-brand-300')}>
          {c}
        </button>
      ))}
      <span className="text-xs text-slate-400">ficha(s) por rodada</span>
    </div>
  )
}

/* ---------------- Coelho ---------------- */
export function Coelho({ play }: GameProps) {
  const { take, add } = useFichas()
  const [bet, setBet] = useState(25)
  const [busy, setBusy] = useState(false)
  const [picked, setPicked] = useState<number | null>(null)
  const [mult, setMult] = useState<number | null>(null)

  const dig = (i: number) => {
    if (busy) return
    if (!take(bet)) return
    setBusy(true); setPicked(i); setMult(null)
    setTimeout(() => {
      const table = [0, 1.3, 1.8, 2.5, 3]
      const m = table[Math.floor(Math.random() * table.length)]
      setMult(m)
      const delta = m > 0 ? Math.round(bet * m) : -bet
      if (m > 0) add(delta)
      play(m > 0 ? `Toca ${i + 1} · x${m}` : `Toca ${i + 1} · vazio`, m > 0 ? 'win' : 'loss', delta)
      setBusy(false)
    }, 500)
  }

  return (
    <div className="space-y-5">
      <BetRow bet={bet} setBet={setBet} disabled={busy} />
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} onClick={() => dig(i)} disabled={busy}
            className={cn('aspect-square rounded-xl border border-white/10 bg-ink-800 text-2xl transition hover:border-brand/50',
              picked === i && (mult && mult > 0 ? 'border-brand bg-brand/10' : 'border-red-500/50 bg-red-500/10'))}>
            {picked === i ? (mult && mult > 0 ? '🐇' : '🕳️') : '🕳️'}
          </button>
        ))}
      </div>
      <p className="text-sm text-slate-400">
        {mult === null ? 'Escolha uma toca. Toca vazia devolve nada; toca com coelho paga até x3.' : mult > 0 ? `Coelho encontrado! +${Math.round(bet * mult)} fichas.` : `Toca vazia: -${bet} fichas.`}
      </p>
    </div>
  )
}

/* ---------------- Rato ---------------- */
export function Rato({ play }: GameProps) {
  const { take, add } = useFichas()
  const [bet, setBet] = useState(25)
  const [cells, setCells] = useState<('hidden' | 'cheese' | 'trap')[]>(Array(9).fill('hidden'))
  const [mult, setMult] = useState(1)
  const [alive, setAlive] = useState(false)

  const start = () => { if (!take(bet)) return; setCells(Array(9).fill('hidden')); setMult(1); setAlive(true) }

  const dig = (i: number) => {
    if (!alive || cells[i] !== 'hidden') return
    const trap = Math.random() < 0.28
    const next = [...cells]
    next[i] = trap ? 'trap' : 'cheese'
    setCells(next)
    if (trap) {
      setAlive(false)
      play('Armadilha', 'loss', -bet)
    } else {
      const m = +(mult + 0.35).toFixed(2)
      setMult(m)
      play(`Queijo x${m}`, 'win', 0)
    }
  }

  const cashout = () => {
    if (!alive || mult <= 1) return
    const win = Math.round(bet * mult)
    add(win); setAlive(false)
    play(`Retirada x${mult}`, 'win', win)
  }

  return (
    <div className="space-y-5">
      <BetRow bet={bet} setBet={setBet} disabled={alive} />
      <div className="grid grid-cols-3 gap-2">
        {cells.map((c, i) => (
          <button key={i} onClick={() => dig(i)} disabled={!alive || c !== 'hidden'}
            className={cn('aspect-square rounded-xl border border-white/10 bg-ink-800 text-2xl',
              c === 'cheese' && 'border-brand bg-brand/10', c === 'trap' && 'border-red-500/60 bg-red-500/10')}>
            {c === 'cheese' ? '🧀' : c === 'trap' ? '🪤' : ''}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-400">Multiplicador: <b className="text-gold">x{mult}</b></span>
        {alive ? <Button variant="gold" onClick={cashout} disabled={mult <= 1}>Retirar {Math.round(bet * mult)}</Button> : <Button onClick={start}>Cavar</Button>}
      </div>
    </div>
  )
}

/* ---------------- Touro ---------------- */
export function Touro({ play }: GameProps) {
  const { take, add } = useFichas()
  const [bet, setBet] = useState(25)
  const [pos, setPos] = useState(50)
  const [running, setRunning] = useState(false)
  const [msg, setMsg] = useState('Pare a barra no centro.')
  const dir = useRef(1)
  const raf = useRef(0)

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const loop = useCallback(() => {
    setPos((p) => {
      let n = p + dir.current * 1.6
      if (n >= 100) { n = 100; dir.current = -1 }
      if (n <= 0) { n = 0; dir.current = 1 }
      return n
    })
    raf.current = requestAnimationFrame(loop)
  }, [])

  const start = () => {
    if (!take(bet)) return
    setRunning(true); setMsg('Correndo…'); raf.current = requestAnimationFrame(loop)
  }

  const stop = () => {
    cancelAnimationFrame(raf.current); setRunning(false)
    const d = Math.abs(pos - 50)
    const m = d < 8 ? 3 : d < 18 ? 2 : d < 30 ? 1.2 : 0
    const delta = m > 0 ? Math.round(bet * m) : -bet
    if (m > 0) add(delta)
    setMsg(m > 0 ? `Acertou! x${m} → +${delta} fichas.` : `Passou longe: -${bet} fichas.`)
    play(m > 0 ? `Centro x${m}` : 'Errou', m > 0 ? 'win' : 'loss', delta)
  }

  return (
    <div className="space-y-5">
      <BetRow bet={bet} setBet={setBet} disabled={running} />
      <div className="relative h-16 overflow-hidden rounded-xl border border-white/10 bg-ink-800">
        <div className="absolute inset-y-0 left-[35%] w-[30%] bg-gold/10" />
        <div className="absolute inset-y-0 left-[46%] w-[8%] bg-brand/25" />
        <div className="absolute inset-y-1 w-1 rounded bg-gold" style={{ left: `${pos}%` }} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{msg}</span>
        {running ? <Button variant="gold" onClick={stop}>Parar</Button> : <Button onClick={start}>Correr</Button>}
      </div>
    </div>
  )
}

/* ---------------- Tigre ---------------- */
const PADS = ['#12d17a', '#e8c56a', '#60a5fa', '#f472b6']

export function Tigre({ play }: GameProps) {
  const { take, add } = useFichas()
  const [bet, setBet] = useState(25)
  const [seq, setSeq] = useState<number[]>([])
  const [input, setInput] = useState<number[]>([])
  const [flash, setFlash] = useState<number | null>(null)
  const [state, setState] = useState<'idle' | 'show' | 'play'>('idle')

  const showSeq = async (s: number[]) => {
    setState('show')
    for (const i of s) {
      setFlash(i); await new Promise((r) => setTimeout(r, 380)); setFlash(null)
      await new Promise((r) => setTimeout(r, 140))
    }
    setState('play')
  }

  const start = async () => {
    if (!take(bet)) return
    const next = [...seq, Math.floor(Math.random() * 4)]
    setSeq(next); setInput([])
    await showSeq(next)
  }

  const press = (i: number) => {
    if (state !== 'play') return
    const next = [...input, i]
    setInput(next); setFlash(i); setTimeout(() => setFlash(null), 180)
    if (next[next.length - 1] !== seq[next.length - 1]) {
      setState('idle'); setSeq([]); setInput([])
      play('Errou a sequência', 'loss', -bet)
      return
    }
    if (next.length === seq.length) {
      const win = bet * seq.length
      add(win); setState('idle'); setSeq([]); setInput([])
      play(`Sequência de ${seq.length}`, 'win', win)
    }
  }

  return (
    <div className="space-y-5">
      <BetRow bet={bet} setBet={setBet} disabled={state !== 'idle'} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PADS.map((c, i) => (
          <button key={i} onClick={() => press(i)} disabled={state === 'show'}
            className="h-20 rounded-xl border border-white/10 transition"
            style={{ background: flash === i ? c : 'rgba(255,255,255,.04)' }} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">
          {state === 'show' ? 'Memorize…' : state === 'play' ? `Repita ${seq.length} toque(s)` : `Nível ${seq.length} · prêmio x${Math.max(seq.length, 1)}`}
        </span>
        {state === 'idle' && <Button onClick={start}>Começar</Button>}
      </div>
    </div>
  )
}

/* ---------------- Dragão ---------------- */
export function Dragao({ play }: GameProps) {
  const { take, add } = useFichas()
  const [bet, setBet] = useState(25)
  const [mine, setMine] = useState<number | null>(null)
  const [his, setHis] = useState<number | null>(null)
  const [msg, setMsg] = useState('Role os dados e desafie o dragão.')

  const roll = () => {
    if (!take(bet)) return
    const a = 1 + Math.floor(Math.random() * 6)
    const b = 1 + Math.floor(Math.random() * 6)
    setMine(a); setHis(b)
    if (a > b) { add(bet * 2); setMsg(`Você venceu ${a} x ${b}. +${bet} fichas.`); play(`${a} x ${b}`, 'win', bet) }
    else if (a === b) { add(bet); setMsg(`Empate ${a} x ${b}. Ficha devolvida.`); play(`${a} x ${b}`, 'draw', 0) }
    else { setMsg(`O dragão venceu ${b} x ${a}. -${bet} fichas.`); play(`${a} x ${b}`, 'loss', -bet) }
  }

  return (
    <div className="space-y-5">
      <BetRow bet={bet} setBet={setBet} disabled={false} />
      <div className="flex items-center justify-around rounded-xl border border-white/10 bg-ink-800 p-6 text-5xl">
        <div className="text-center"><p className="mb-2 text-xs text-slate-400">Você</p>{mine ?? '🎲'}</div>
        <span className="text-base text-slate-500">vs</span>
        <div className="text-center"><p className="mb-2 text-xs text-slate-400">Dragão</p>{his ?? '🐉'}</div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{msg}</span>
        <Button onClick={roll}>Rolar</Button>
      </div>
    </div>
  )
}

/* ---------------- Roleta ---------------- */
const SEGMENTS = [0, 1.5, 2, 0.5, 3, 0, 1.2, 2.5, 0, 1.8, 4, 0.5]

export function Roleta({ play }: GameProps) {
  const { take, add } = useFichas()
  const [bet, setBet] = useState(25)
  const [angle, setAngle] = useState(0)
  const [spin, setSpin] = useState(false)
  const [res, setRes] = useState<number | null>(null)

  const go = () => {
    if (!take(bet)) return
    setSpin(true); setRes(null)
    const idx = Math.floor(Math.random() * SEGMENTS.length)
    const m = SEGMENTS[idx]
    const target = 360 * 5 + (360 / SEGMENTS.length) * idx
    setAngle((a) => a + target)
    setTimeout(() => {
      setSpin(false); setRes(m)
      const delta = m > 0 ? Math.round(bet * m) : -bet
      if (m > 0) add(delta)
      play(m > 0 ? `x${m}` : 'zero', m > 0 ? 'win' : 'loss', delta)
    }, 2600)
  }

  return (
    <div className="space-y-5">
      <BetRow bet={bet} setBet={setBet} disabled={spin} />
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-56 w-56">
          <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 text-gold">▼</div>
          <div
            className="h-56 w-56 rounded-full border-4 border-gold/40"
            style={{
              transform: `rotate(${angle}deg)`,
              transition: 'transform 2.5s cubic-bezier(.15,.9,.1,1)',
              background: `conic-gradient(${SEGMENTS.map((_, i) => `${i % 2 ? '#12d17a33' : '#16233f'} ${(i * 360) / 12}deg ${((i + 1) * 360) / 12}deg`).join(',')})`,
            }}
          />
        </div>
        <p className="text-sm text-slate-400">{res === null ? 'Gire a roda.' : res > 0 ? `Multiplicador x${res}!` : 'Caiu no zero.'}</p>
        <Button onClick={go} disabled={spin}>{spin ? 'Girando…' : 'Girar'}</Button>
      </div>
    </div>
  )
}

/* ---------------- Slots ---------------- */
const SYMBOLS = ['🐸', '🍀', '💎', '⭐', '🔔']
const PAY: Record<string, number> = { '🐸': 3, '🍀': 4, '💎': 6, '⭐': 8, '🔔': 10 }

export function Slots({ play }: GameProps) {
  const { take, add } = useFichas()
  const [bet, setBet] = useState(25)
  const [reels, setReels] = useState(['❔', '❔', '❔'])
  const [spin, setSpin] = useState(false)

  const go = () => {
    if (!take(bet)) return
    setSpin(true)
    const timer = setInterval(() => setReels([0, 1, 2].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])), 90)
    setTimeout(() => {
      clearInterval(timer)
      const final = [0, 1, 2].map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
      setReels(final); setSpin(false)
      if (final[0] === final[1] && final[1] === final[2]) {
        const win = bet * (PAY[final[0]] ?? 3)
        add(win); play(`3x ${final[0]}`, 'win', win)
      } else if (final[0] === final[1] || final[1] === final[2]) {
        add(bet); play('Par', 'draw', 0)
      } else {
        play('Sem prêmio', 'loss', -bet)
      }
    }, 1200)
  }

  return (
    <div className="space-y-5">
      <BetRow bet={bet} setBet={setBet} disabled={spin} />
      <div className="mx-auto flex max-w-sm justify-center gap-3 rounded-2xl border border-gold/30 bg-ink-800 p-6">
        {reels.map((s, i) => <span key={i} className="grid h-20 w-20 place-items-center rounded-xl bg-black/40 text-4xl">{s}</span>)}
      </div>
      <div className="flex justify-center"><Button onClick={go} disabled={spin}>{spin ? 'Girando…' : 'Girar'}</Button></div>
      <p className="text-center text-xs text-slate-500">3 iguais: 🐸x3 · 🍀x4 · 💎x6 · ⭐x8 · 🔔x10. Dois iguais devolvem a ficha.</p>
    </div>
  )
}

/* ---------------- Crash ---------------- */
export function Crash({ play }: GameProps) {
  const { take, add } = useFichas()
  const [bet, setBet] = useState(25)
  const [mult, setMult] = useState(1)
  const [running, setRunning] = useState(false)
  const [crashed, setCrashed] = useState(false)
  const timer = useRef<number | null>(null)
  const crashAt = useRef(2)

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current) }, [])

  const start = () => {
    if (!take(bet)) return
    setRunning(true); setCrashed(false); setMult(1)
    crashAt.current = 1.1 + Math.random() * 7
    timer.current = window.setInterval(() => {
      setMult((m) => {
        const next = +(m + 0.06 + m * 0.012).toFixed(2)
        if (next >= crashAt.current) {
          if (timer.current) window.clearInterval(timer.current)
          setRunning(false); setCrashed(true)
          play(`Estourou em x${next}`, 'loss', -bet)
          return next
        }
        return next
      })
    }, 100)
  }

  const cashout = () => {
    if (!running) return
    if (timer.current) window.clearInterval(timer.current)
    setRunning(false)
    const win = Math.round(bet * mult)
    add(win); play(`Retirada x${mult}`, 'win', win)
  }

  return (
    <div className="space-y-5">
      <BetRow bet={bet} setBet={setBet} disabled={running} />
      <div className="grid place-items-center rounded-2xl border border-white/10 bg-ink-800 py-14">
        <span className={cn('font-display text-6xl font-extrabold', crashed ? 'text-red-400' : 'text-brand')}>x{mult.toFixed(2)}</span>
        <span className="mt-2 text-xs text-slate-500">{crashed ? 'Estourou' : running ? 'Em andamento' : 'Aguardando'}</span>
      </div>
      <div className="flex justify-center">
        {running ? <Button variant="gold" onClick={cashout}>Retirar {Math.round(bet * mult)}</Button> : <Button onClick={start}>Apostar</Button>}
      </div>
      <p className="text-center text-xs text-slate-500">O multiplicador sobe até estourar. Retire antes.</p>
    </div>
  )
        }
