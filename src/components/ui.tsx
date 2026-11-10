import { forwardRef, type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost' | 'outline' | 'danger' | 'gold'
const variants: Record<Variant, string> = {
  primary: 'bg-brand text-ink-950 hover:bg-brand-300 shadow-glow font-semibold',
  gold: 'bg-gold text-ink-950 hover:bg-gold-600 font-semibold',
  ghost: 'bg-white/5 text-white hover:bg-white/10',
  outline: 'border border-white/15 text-white hover:border-brand/60 hover:text-brand-300',
  danger: 'bg-red-500/90 text-white hover:bg-red-500',
}

export function Button({ variant = 'primary', className, size = 'md', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <button
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-xl transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        size === 'sm' ? 'h-9 px-3 text-sm' : size === 'lg' ? 'h-12 px-7 text-base' : 'h-11 px-5 text-sm',
        className,
      )}
      {...props}
    />
  )
}

const field = 'w-full rounded-xl border border-white/10 bg-ink-900 px-4 text-sm text-white placeholder:text-slate-500 focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...p }, ref) => (
  <input ref={ref} className={cn(field, 'h-11', className)} {...p} />
))
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...p }, ref) => (
  <textarea ref={ref} className={cn(field, 'p-4', className)} {...p} />
))
Textarea.displayName = 'Textarea'

export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('glass p-5', className)} {...p} />
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function Spinner({ label = 'Carregando' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
      <span className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-brand" />
      <span className="text-sm">{label}…</span>
    </div>
  )
}

const tones = { neutral: 'bg-white/10 text-slate-300', success: 'bg-brand/15 text-brand-300', warn: 'bg-gold/15 text-gold', danger: 'bg-red-500/15 text-red-300' }

export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof tones; children: React.ReactNode }) {
  return <span className={cn('inline-flex rounded-full px-2.5 py-1 text-xs font-medium', tones[tone])}>{children}</span>
}

export function EmptyState({ title, description, icon }: { title: string; description?: string; icon?: React.ReactNode }) {
  return (
    <div className="glass flex flex-col items-center gap-2 px-6 py-14 text-center">
      <div className="text-slate-500">{icon}</div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      {description && <p className="max-w-sm text-sm text-slate-400">{description}</p>}
    </div>
  )
}
