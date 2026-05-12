'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  BarChart3,
  Truck,
  HelpCircle,
  Settings,
  ChevronRight,
  ChevronLeft,
  Users,
  LogOut,
  PlusCircle,
  ClipboardList,
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

interface NavGroup {
  label: string
  minRole?: Role
  items: NavItem[]
}

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navGroups: NavGroup[] = [
  {
    label: 'Dashboard',
    items: [
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
    ],
  },
  {
    label: 'Gestionar encuestas',
    minRole: 'editor',
    items: [
      {
        href: '/gestionar-encuestas/crear',
        label: 'Crear encuesta',
        icon: PlusCircle,
        enabled: true,
        minRole: 'editor',
      },
      {
        href: '/gestionar-encuestas/encuestas',
        label: 'Encuestas',
        icon: ClipboardList,
        enabled: true,
        minRole: 'editor',
      },
    ],
  },
  {
    label: 'Configuración',
    minRole: 'editor',
    items: [
      {
        href: '/configuracion',
        label: 'Subir CSV',
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
    ],
  },
]

function roleLabel(role: Role | null): string {
  if (role === 'dios') return 'Dios'
  if (role === 'editor') return 'Editor'
  return 'Visitante'
}

function canSee(minRole: Role | undefined, role: Role | null): boolean {
  if (!minRole) return true
  if (minRole === 'editor') return role === 'editor' || role === 'dios'
  if (minRole === 'dios') return role === 'dios'
  return true
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, role, loading, signOut } = useAuth()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  // Filter groups/items the current role can see
  const visibleGroups = navGroups
    .filter(g => canSee(g.minRole, role))
    .map(g => ({
      ...g,
      items: g.items.filter(item => canSee(item.minRole, role)),
    }))
    .filter(g => g.items.length > 0)

  return (
    <aside
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
      className={`fixed left-0 top-0 h-full flex flex-col z-20 transition-all duration-200 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Logo + toggle */}
      <div
        className={`flex items-center border-b border-blue-700/20 transition-all duration-200 ${
          collapsed ? 'justify-center px-0 py-5' : 'justify-between px-6 py-6'
        }`}
      >
        {!collapsed && (
          <Image
            src="/logo_fravega.svg"
            alt="Frávega"
            width={110}
            height={17}
            priority
          />
        )}
        <button
          onClick={onToggle}
          className="text-blue-600 hover:text-blue-800 transition-colors shrink-0"
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {visibleGroups.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? 'mt-4' : ''}>
            {/* Group header */}
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-blue-400 select-none">
                {group.label}
              </p>
            )}
            {collapsed && gi > 0 && (
              <div className="my-2 mx-2 border-t border-blue-700/20" />
            )}

            <div className="space-y-0.5">
              {group.items.map(item => {
                const Icon = item.icon

                if (!item.enabled) {
                  return (
                    <div
                      key={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`flex items-center rounded-lg opacity-40 cursor-not-allowed transition-all ${
                        collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
                      }`}
                    >
                      <Icon size={18} className="text-blue-600 shrink-0" />
                      {!collapsed && (
                        <span className="text-blue-600 text-sm flex-1">{item.label}</span>
                      )}
                    </div>
                  )
                }

                const isActive =
                  item.href === '/gestionar-encuestas/crear'
                    ? pathname === item.href || pathname.startsWith('/gestionar-encuestas/crear')
                    : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center rounded-lg transition-all group ${
                      collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-blue-700/20 text-blue-700'
                        : 'text-blue-600 hover:bg-black/5 hover:text-blue-800'
                    }`}
                  >
                    <Icon
                      size={18}
                      className={`shrink-0 ${isActive ? 'text-blue-700' : 'text-blue-600 group-hover:text-blue-800'}`}
                    />
                    {!collapsed && (
                      <>
                        <span className="text-sm flex-1">{item.label}</span>
                        {isActive && <ChevronRight size={14} className="text-blue-700" />}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User info + logout */}
      <div className={`py-4 border-t border-blue-700/20 ${collapsed ? 'px-2' : 'px-4'}`}>
        {!collapsed && !loading && user && (
          <div className="mb-3">
            <p className="text-blue-700 text-xs font-medium truncate">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-700/15 text-blue-700">
              {roleLabel(role)}
            </span>
          </div>
        )}
        <button
          onClick={handleSignOut}
          title={collapsed ? 'Cerrar sesión' : undefined}
          className={`flex items-center text-blue-600 hover:text-blue-800 text-sm transition-colors w-full ${
            collapsed ? 'justify-center gap-0' : 'gap-2'
          }`}
        >
          <LogOut size={15} />
          {!collapsed && 'Cerrar sesión'}
        </button>
      </div>
    </aside>
  )
}
