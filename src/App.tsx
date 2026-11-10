import { useEffect } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AdminLayout, PublicLayout } from '@/components/layout'
import { Spinner } from '@/components/ui'
import { useAuthStore } from '@/store'
import Home from '@/pages/Home'
import GamePage from '@/pages/GamePage'
import { Favorites, Games } from '@/pages/Catalog'
import { ForgotPassword, Login, Register, ResetPassword } from '@/pages/Auth'
import { Legal, NotFound, Profile, Support } from '@/pages/Account'
import { Banners, Categories, Dashboard, GamesAdmin, Logs, SettingsPage, Tickets, Users } from '@/pages/Admin'

function Protected() {
  const { profile, initialized } = useAuthStore()
  const location = useLocation()
  if (!initialized) return <Spinner label="Verificando sessão" />
  if (!profile) return <Navigate to="/entrar" state={{ from: location.pathname }} replace />
  return <Outlet />
}

function AdminOnly() {
  const { profile, initialized } = useAuthStore()
  if (!initialized) return <Spinner label="Verificando permissões" />
  if (!profile) return <Navigate to="/entrar" replace />
  if (profile.role !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}

export default function App() {
  const init = useAuthStore((s) => s.init)
  useEffect(() => { void init() }, [init])

  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="jogos" element={<Games />} />
        <Route path="jogos/:slug" element={<GamePage />} />
        <Route path="favoritos" element={<Favorites />} />
        <Route path="entrar" element={<Login />} />
        <Route path="cadastrar" element={<Register />} />
        <Route path="recuperar-senha" element={<ForgotPassword />} />
        <Route path="redefinir-senha" element={<ResetPassword />} />
        <Route path="suporte" element={<Support />} />
        <Route path="termos" element={<Legal />} />
        <Route path="privacidade" element={<Legal />} />
        <Route path="jogo-responsavel" element={<Legal />} />
        <Route element={<Protected />}>
          <Route path="perfil" element={<Profile />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<AdminOnly />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="usuarios" element={<Users />} />
          <Route path="jogos" element={<GamesAdmin />} />
          <Route path="categorias" element={<Categories />} />
          <Route path="banners" element={<Banners />} />
          <Route path="chamados" element={<Tickets />} />
          <Route path="configuracoes" element={<SettingsPage />} />
          <Route path="logs" element={<Logs />} />
        </Route>
      </Route>
    </Routes>
  )
}
