import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle2 } from 'lucide-react'
import { Logo } from '@/components/layout'
import { Button, Input } from '@/components/ui'
import { useAuthStore } from '@/store'

function Shell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="container-app grid min-h-[70vh] place-items-center py-12">
      <div className="glass w-full max-w-md p-7">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <h1 className="text-center text-2xl font-bold">{title}</h1>
        <p className="mt-1 text-center text-sm text-slate-400">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}

const loginSchema = z.object({ email: z.string().email('E-mail inválido'), password: z.string().min(6, 'Mínimo de 6 caracteres') })
type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const signIn = useAuthStore((s) => s.signIn)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (v: LoginForm) => {
    setError(null)
    try {
      await signIn(v.email, v.password)
      navigate((location.state as { from?: string })?.from ?? '/', { replace: true })
    } catch (e) { setError((e as Error).message) }
  }

  return (
    <Shell title="Entrar" subtitle="Acesse para salvar favoritos e histórico.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs text-slate-400">E-mail</label>
          <Input type="email" autoComplete="email" {...register('email')} />
          {formState.errors.email && <p className="mt-1 text-xs text-red-400">{formState.errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-slate-400">Senha</label>
          <Input type="password" autoComplete="current-password" {...register('password')} />
          {formState.errors.password && <p className="mt-1 text-xs text-red-400">{formState.errors.password.message}</p>}
        </div>
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
        <Button type="submit" className="w-full" disabled={formState.isSubmitting}>{formState.isSubmitting ? 'Entrando…' : 'Entrar'}</Button>
      </form>
      <div className="mt-4 flex justify-between text-xs">
        <Link to="/recuperar-senha" className="text-slate-400 hover:text-brand-300">Esqueci a senha</Link>
        <Link to="/cadastrar" className="text-brand-300">Criar conta</Link>
      </div>
    </Shell>
  )
}

const registerSchema = z.object({
  username: z.string().min(3, 'Mínimo de 3').max(24).regex(/^[a-zA-Z0-9_]+$/, 'Use letras, números e _'),
  fullName: z.string().min(3, 'Informe seu nome').max(80),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo de 8 caracteres'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { path: ['confirm'], message: 'Senhas diferentes' })
type RegisterForm = z.infer<typeof registerSchema>

export function Register() {
  const signUp = useAuthStore((s) => s.signUp)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const { register, handleSubmit, formState } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (v: RegisterForm) => {
    setError(null)
    try {
      const { needsConfirmation } = await signUp(v.email, v.password, v.username, v.fullName)
      if (needsConfirmation) setDone(true)
      else window.location.assign('/')
    } catch (e) { setError((e as Error).message) }
  }

  if (done) {
    return (
      <Shell title="Confirme seu e-mail" subtitle="Enviamos um link de confirmação.">
        <div className="text-center"><CheckCircle2 className="mx-auto text-brand" size={40} /></div>
        <p className="mt-4 text-center text-sm text-slate-400">Depois de confirmar, volte e faça login.</p>
        <Link to="/entrar" className="mt-5 block"><Button className="w-full">Ir para o login</Button></Link>
      </Shell>
    )
  }

  return (
    <Shell title="Criar conta" subtitle="Grátis, sem dados de pagamento.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="mb-1.5 block text-xs text-slate-400">Usuário</label>
          <Input {...register('username')} />
          {formState.errors.username && <p className="mt-1 text-xs text-red-400">{formState.errors.username.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-slate-400">Nome completo</label>
          <Input {...register('fullName')} />
          {formState.errors.fullName && <p className="mt-1 text-xs text-red-400">{formState.errors.fullName.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-slate-400">E-mail</label>
          <Input type="email" autoComplete="email" {...register('email')} />
          {formState.errors.email && <p className="mt-1 text-xs text-red-400">{formState.errors.email.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-slate-400">Senha</label>
          <Input type="password" autoComplete="new-password" {...register('password')} />
          {formState.errors.password && <p className="mt-1 text-xs text-red-400">{formState.errors.password.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-slate-400">Confirmar senha</label>
          <Input type="password" autoComplete="new-password" {...register('confirm')} />
          {formState.errors.confirm && <p className="mt-1 text-xs text-red-400">{formState.errors.confirm.message}</p>}
        </div>
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
        <Button type="submit" className="w-full" disabled={formState.isSubmitting}>{formState.isSubmitting ? 'Criando…' : 'Criar conta'}</Button>
      </form>
      <p className="mt-4 text-center text-xs text-slate-400">Já tem conta? <Link to="/entrar" className="text-brand-300">Entrar</Link></p>
    </Shell>
  )
}

const emailSchema = z.object({ email: z.string().email('E-mail inválido') })
type EmailForm = z.infer<typeof emailSchema>

export function ForgotPassword() {
  const resetPassword = useAuthStore((s) => s.resetPassword)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState } = useForm<EmailForm>({ resolver: zodResolver(emailSchema) })

  const onSubmit = async (v: EmailForm) => {
    setError(null); setMsg(null)
    try { await resetPassword(v.email); setMsg('Link enviado. Verifique sua caixa de entrada.') }
    catch (e) { setError((e as Error).message) }
  }

  return (
    <Shell title="Recuperar senha" subtitle="Enviaremos um link para redefinir.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input type="email" placeholder="seu@email.com" {...register('email')} />
        {formState.errors.email && <p className="text-xs text-red-400">{formState.errors.email.message}</p>}
        {msg && <p className="rounded-lg bg-brand/10 px-3 py-2 text-xs text-brand-300">{msg}</p>}
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
        <Button type="submit" className="w-full">Enviar link</Button>
      </form>
      <p className="mt-4 text-center text-xs"><Link to="/entrar" className="text-slate-400 hover:text-brand-300">Voltar ao login</Link></p>
    </Shell>
  )
}

const pwSchema = z.object({ password: z.string().min(8, 'Mínimo de 8 caracteres') })
type PwForm = z.infer<typeof pwSchema>

export function ResetPassword() {
  const updatePassword = useAuthStore((s) => s.updatePassword)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit } = useForm<PwForm>({ resolver: zodResolver(pwSchema) })

  const onSubmit = async (v: PwForm) => {
    setError(null)
    try { await updatePassword(v.password); setMsg('Senha alterada. Você já pode entrar.') }
    catch (e) { setError((e as Error).message) }
  }

  return (
    <Shell title="Nova senha" subtitle="Defina uma senha forte.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input type="password" placeholder="Nova senha" {...register('password')} />
        {msg && <p className="rounded-lg bg-brand/10 px-3 py-2 text-xs text-brand-300">{msg}</p>}
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
        <Button type="submit" className="w-full">Salvar</Button>
      </form>
      <p className="mt-4 text-center text-xs"><Link to="/entrar" className="text-brand-300">Ir para o login</Link></p>
    </Shell>
  )
}
