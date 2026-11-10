import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, LogOut, Send } from 'lucide-react'
import { Badge, Button, Card, EmptyState, Input, Spinner, Textarea } from '@/components/ui'
import { useAuthStore, useFichas } from '@/store'
import { supabase } from '@/lib/supabase'
import { createTicket, fetchMyTickets } from '@/services/api'
import { formatDateTime, initials } from '@/lib/utils'
import type { Ticket } from '@/types'

const profileSchema = z.object({
  username: z.string().min(3, 'Mínimo de 3').max(24).regex(/^[a-zA-Z0-9_]+$/, 'Use letras, números e _'),
  full_name: z.string().min(3, 'Informe seu nome').max(80),
})
type ProfileForm = z.infer<typeof profileSchema>

export function Profile() {
  const { profile, updateProfile, signOut } = useAuthStore()
  const reset = useFichas((s) => s.reset)
  const navigate = useNavigate()
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const { register, handleSubmit, reset: resetForm, formState } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: profile?.username ?? '', full_name: profile?.full_name ?? '' },
  })

  useEffect(() => {
    resetForm({ username: profile?.username ?? '', full_name: profile?.full_name ?? '' })
  }, [profile, resetForm])

  const onSubmit = async (v: ProfileForm) => {
    setError(null); setMsg(null)
    try { await updateProfile(v); setMsg('Perfil atualizado.') }
    catch (e) { setError((e as Error).message) }
  }

  const upload = async (file: File) => {
    if (!profile) return
    setUploading(true); setError(null)
    try {
      const path = `${profile.id}/${Date.now()}-${file.name.replace(/\s/g, '-')}`
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await updateProfile({ avatar_url: data.publicUrl })
      setMsg('Avatar atualizado.')
    } catch (e) { setError((e as Error).message) }
    finally { setUploading(false) }
  }

  return (
    <div className="container-app max-w-3xl py-10">
      <h1 className="text-3xl font-extrabold">Meu perfil</h1>
      <p className="mt-1 text-sm text-slate-400">Dados da conta e preferências locais.</p>

      <Card className="mt-6 flex items-center gap-4">
        <div className="relative">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="" className="h-16 w-16 rounded-full object-cover" />
            : <span className="grid h-16 w-16 place-items-center rounded-full bg-brand/15 font-bold text-brand">{initials(profile?.full_name)}</span>}
          <label className="absolute -bottom-1 -right-1 grid h-7 w-7 cursor-pointer place-items-center rounded-full bg-gold text-ink-950">
            <Camera size={14} />
            <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
          </label>
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">{profile?.full_name ?? profile?.username}</p>
          <p className="truncate text-xs text-slate-400">@{profile?.username}</p>
          <div className="mt-1"><Badge tone={profile?.role === 'admin' ? 'warn' : 'neutral'}>{profile?.role === 'admin' ? 'Administrador' : 'Jogador'}</Badge></div>
        </div>
        {uploading && <Spinner label="Enviando" />}
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="glass mt-5 space-y-4 p-5">
        <div>
          <label className="mb-1.5 block text-xs text-slate-400">Usuário</label>
          <Input {...register('username')} />
          {formState.errors.username && <p className="mt-1 text-xs text-red-400">{formState.errors.username.message}</p>}
        </div>
        <div>
          <label className="mb-1.5 block text-xs text-slate-400">Nome completo</label>
          <Input {...register('full_name')} />
          {formState.errors.full_name && <p className="mt-1 text-xs text-red-400">{formState.errors.full_name.message}</p>}
        </div>
        {msg && <p className="rounded-lg bg-brand/10 px-3 py-2 text-xs text-brand-300">{msg}</p>}
        {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={formState.isSubmitting}>Salvar</Button>
          <Button type="button" variant="outline" onClick={() => { reset(); setMsg('Fichas repostas para 1.000.') }}>Repor fichas</Button>
          <Button type="button" variant="ghost" onClick={async () => { await signOut(); navigate('/') }}><LogOut size={16} /> Sair</Button>
        </div>
      </form>
    </div>
  )
}

const ticketSchema = z.object({
  name: z.string().min(3, 'Informe seu nome'),
  email: z.string().email('E-mail inválido'),
  subject: z.string().min(4, 'Descreva o assunto').max(120),
  message: z.string().min(20, 'Mínimo de 20 caracteres').max(2000),
})
type TicketForm = z.infer<typeof ticketSchema>

export function Support() {
  const profile = useAuthStore((s) => s.profile)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, reset, formState } = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { name: profile?.full_name ?? '', email: '' },
  })

  useEffect(() => { void fetchMyTickets().then(setTickets) }, [])

  const onSubmit = async (v: TicketForm) => {
    setError(null); setMsg(null)
    try {
      await createTicket(v)
      setMsg('Chamado aberto. Responderemos por e-mail.')
      reset({ name: v.name, email: v.email, subject: '', message: '' })
      setTickets(await fetchMyTickets())
    } catch (e) { setError((e as Error).message) }
  }

  return (
    <div className="container-app max-w-4xl py-10">
      <h1 className="text-3xl font-extrabold">Atendimento</h1>
      <p className="mt-1 text-sm text-slate-400">Abra um chamado. Conta gratuita não é obrigatória.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <form onSubmit={handleSubmit(onSubmit)} className="glass space-y-3 p-5">
          <Input placeholder="Seu nome" {...register('name')} />
          {formState.errors.name && <p className="text-xs text-red-400">{formState.errors.name.message}</p>}
          <Input type="email" placeholder="Seu e-mail" {...register('email')} />
          {formState.errors.email && <p className="text-xs text-red-400">{formState.errors.email.message}</p>}
          <Input placeholder="Assunto" {...register('subject')} />
          {formState.errors.subject && <p className="text-xs text-red-400">{formState.errors.subject.message}</p>}
          <Textarea rows={6} placeholder="Descreva o problema com detalhes" {...register('message')} />
          {formState.errors.message && <p className="text-xs text-red-400">{formState.errors.message.message}</p>}
          {msg && <p className="rounded-lg bg-brand/10 px-3 py-2 text-xs text-brand-300">{msg}</p>}
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
          <Button type="submit" disabled={formState.isSubmitting}><Send size={16} /> Abrir chamado</Button>
        </form>

        <div>
          <h2 className="mb-3 text-sm font-semibold">Meus chamados</h2>
          {tickets.length === 0
            ? <EmptyState title="Nenhum chamado" description="Seus chamados aparecem aqui." />
            : <ul className="space-y-3">
                {tickets.map((t) => (
                  <li key={t.id} className="glass p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{t.subject}</p>
                      <Badge tone={t.status === 'open' ? 'warn' : t.status === 'closed' ? 'success' : 'neutral'}>{t.status}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">{t.message}</p>
                    <p className="mt-2 text-[11px] text-slate-500">{formatDateTime(t.created_at)}</p>
                  </li>
                ))}
              </ul>}
        </div>
      </div>
    </div>
  )
}

const legalContent: Record<string, { title: string; blocks: string[] }> = {
  '/termos': {
    title: 'Termos de uso',
    blocks: [
      'Sapolandia Play é uma plataforma de entretenimento com jogos gratuitos. Não há depósito, saque, bônus em dinheiro ou prêmio financeiro.',
      'As fichas são virtuais, sem valor monetário, e podem ser repostas livremente. Resultados são gerados no navegador e podem variar entre dispositivos.',
      'A conta é pessoal. Você é responsável por manter a senha em segurança. Contas com uso abusivo podem ser suspensas.',
      'O serviço é fornecido "como está", sem garantia de disponibilidade contínua. Podemos alterar jogos, categorias e regras a qualquer momento.',
    ],
  },
  '/privacidade': {
    title: 'Política de privacidade',
    blocks: [
      'Coletamos apenas o necessário: e-mail, nome, usuário, avatar opcional e histórico de sessões de jogo.',
      'A autenticação e o banco de dados são operados pelo Supabase. Senhas são armazenadas com hash pelo provedor.',
      'Favoritos, histórico e saldo de fichas também ficam no seu dispositivo (localStorage) para funcionar offline.',
      'Você pode solicitar exclusão da conta pelo atendimento. Ao excluir, o perfil e os registros vinculados são removidos.',
    ],
  },
  '/jogo-responsavel': {
    title: 'Jogo responsável',
    blocks: [
      'Como não há dinheiro real, o risco financeiro é zero — mas a plataforma foi desenhada com ritmo de jogo de cassino.',
      'Use as fichas como marcador de sessão: defina um limite e reponha apenas quando quiser recomeçar.',
      'Nenhum jogo aqui simula RTP certificado de operador licenciado. Os multiplicadores são definidos pelo próprio jogo.',
    ],
  },
}

export function Legal() {
  const { pathname } = useLocation()
  const content = legalContent[pathname] ?? legalContent['/termos']
  return (
    <div className="container-app max-w-3xl py-12">
      <h1 className="text-3xl font-extrabold">{content.title}</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-300">
        {content.blocks.map((b, i) => <p key={i}>{b}</p>)}
      </div>
      <p className="mt-8 text-xs text-slate-500">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
      <Link to="/suporte" className="mt-4 inline-block text-sm text-brand-300">Falar com o atendimento</Link>
    </div>
  )
}

export function NotFound() {
  return (
    <div className="container-app grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <p className="font-display text-6xl font-extrabold text-gold">404</p>
        <h1 className="mt-3 text-xl font-bold">Página não encontrada</h1>
        <Link to="/" className="mt-5 inline-block"><Button>Voltar ao início</Button></Link>
      </div>
    </div>
  )
}
