import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ShoppingCart, Package, Users, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { authService } from '@/services/auth.service'
import React, { useState } from 'react'

export function Layout() {
  const { usuario, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarAberta, setSidebarAberta] = useState(true)

  async function handleLogout() {
    try { await authService.logout() } finally {
      clearAuth()
      navigate('/login')
    }
  }

  const isAdmin = usuario?.perfil === 'admin'
  const inicial = usuario?.nome?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="flex h-screen bg-[#F0EDE8]">

      {/* ── Sidebar ──────────────────────────────── */}
      <aside className={`flex-shrink-0 bg-[#1C1C1C] flex flex-col relative z-20 transition-all duration-200 ${sidebarAberta ? 'w-52' : 'w-0 overflow-hidden'}`}>

        {/* Logo */}
        <div className="px-5 py-3">
          <NavLink to="/" className="block hover:opacity-80 transition-opacity">
            <img
              src="/logo-bezerra.png"
              alt="Bezerra Autopeças"
              className="w-full h-auto object-contain"
            />
          </NavLink>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pt-0 space-y-0.5 overflow-y-auto">
          <SidebarLink to="/" icon={<Package className="h-3.5 w-3.5" />} end>
            Catálogo
          </SidebarLink>
          <SidebarLink to="/carrinho" icon={<ShoppingCart className="h-3.5 w-3.5" />}>
            Carrinho
          </SidebarLink>

          {isAdmin && (
            <div className="pt-4 pb-1 px-2">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.15em]">Administração</p>
            </div>
          )}
          {isAdmin && (
            <SidebarLink to="/admin/usuarios" icon={<Users className="h-3.5 w-3.5" />}>
              Gestão de Usuários
            </SidebarLink>
          )}
        </nav>

        {/* Perfil */}
        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl hover:bg-white/[0.05] cursor-pointer group transition-all"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5AD00] text-[13px] font-black text-[#1C1C1C] flex-shrink-0">
              {inicial}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[12px] font-bold text-white/70 truncate leading-tight">{usuario?.nome}</p>
              <p className="text-[9px] text-[#F5AD00] truncate uppercase tracking-[0.12em] mt-0.5 font-black">{usuario?.perfil === 'admin' ? 'Admin' : 'Consultor'}</p>
            </div>
            <LogOut className="h-3.5 w-3.5 text-white/10 group-hover:text-red-400 transition-colors flex-shrink-0" />
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Outlet context={{ sidebarAberta, setSidebarAberta }} />
      </main>
    </div>
  )
}

function SidebarLink({
  to, icon, children, end,
}: {
  to: string
  icon: React.ReactNode
  children: React.ReactNode
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all duration-150 cursor-pointer ${
          isActive
            ? 'bg-[#F5AD00] text-[#1C1C1C] font-black'
            : 'text-white/35 hover:text-white/70 hover:bg-white/[0.04]'
        }`
      }
    >
      {({ isActive: _ }) => (
        <>
          <span className="flex-shrink-0">{icon}</span>
          <span className="truncate">{children}</span>
        </>
      )}
    </NavLink>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 py-2.5 bg-white border-b border-[#E8E4DE]">
      <div className="flex flex-col">
        <h1 className="text-[15px] font-black text-[#1C1C1C] tracking-tight leading-none">{title}</h1>
        {subtitle && <p className="text-[11px] text-[#999] mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}

