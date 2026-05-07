'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Truck,
  HelpCircle,
  Settings,
  ChevronRight,
  Users,
  LogOut,
} from 'lucide-react'
import { useAuth, type Role } from '@/lib/auth-context'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  enabled: boolean
  badge?: string
  minRole?: Role
}

const navItems: NavItem[] = [
  {
    href: '/nps-post-compra',
    label: 'NPS Post Compra',
    icon: BarChart3,
    enabled: true,
  },
  {
    href: '/nps-post-entrega',
    label: 'NPS Post Entrega',
    icon: Truck,
    enabled: true,
  },
  {
    href: '/como-medimos',
    label: '¿Cómo medimos?',
    icon: HelpCircle,
    enabled: true,
  },
  {
    href: '/configuracion',
    label: 'Configuración',
    icon: Settings,
    enabled: true,
    minRole: 'editor',
  },
  {
    href: '/gestion-usuarios',
    label: 'Gestión de usuarios',
    icon: Users,
    enabled: true,
    minRole: 'dios',
  },
]

function roleLabel(role: Role | null): string {
  if (role === 'dios') return 'Dios'
  if (role === 'editor') return 'Editor'
  return 'Visitante'
}

function canSeeItem(item: NavItem, role: Role | null): boolean {
  if (!item.minRole) return true
  if (item.minRole === 'editor') return role === 'editor' || role === 'dios'
  if (item.minRole === 'dios') return role === 'dios'
  return true
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, role, loading, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
      className="fixed left-0 top-0 h-full w-64 flex flex-col z-20"
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <h1 className="text-white font-bold text-lg leading-tight">
          Métricas de<br />Experiencia
        </h1>
        <p className="text-slate-400 text-xs mt-1">Dashboard NPS</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon

          if (!canSeeItem(item, role)) return null

          if (!item.enabled) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-40 cursor-not-allowed"
              >
                <Icon size={18} className="text-slate-400 shrink-0" />
                <span className="text-slate-400 text-sm flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </div>
            )
          }

          const isActive = pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive
                  ? 'bg-blue-500/15 text-blue-400'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon
                size={18}
                className={`shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`}
              />
              <span className="text-sm flex-1">{item.label}</span>
              {isActive && <ChevronRight size={14} className="text-blue-400" />}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="px-4 py-4 border-t border-white/10">
        {!loading && user && (
          <div className="mb-3">
            <p className="text-slate-300 text-xs font-medium truncate">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
              {roleLabel(role)}
            </span>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors w-full"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
