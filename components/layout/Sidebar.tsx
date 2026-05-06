'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Truck,
  HelpCircle,
  Settings,
  ChevronRight,
} from 'lucide-react'

const navItems = [
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
    enabled: false,
    badge: 'Próximamente',
  },
  {
    href: '/como-medimos',
    label: '¿Cómo medimos?',
    icon: HelpCircle,
    enabled: false,
    badge: 'Próximamente',
  },
  {
    href: '/configuracion',
    label: 'Configuración',
    icon: Settings,
    enabled: true,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      style={{ backgroundColor: 'var(--sidebar-bg)' }}
      className="fixed left-0 top-0 h-full w-64 flex flex-col z-20"
    >
      {/* Logo / Title */}
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
          const isActive = pathname.startsWith(item.href)

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

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-slate-500 text-xs">v1.0.0 · MVP</p>
      </div>
    </aside>
  )
}
