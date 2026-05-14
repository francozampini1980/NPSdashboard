'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'
import { useAuth } from '@/lib/auth-context'

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirigir al login si la sesión expiró mientras el dashboard estaba abierto
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved === 'true') setCollapsed(true)
  }, [])

  function toggle() {
    setCollapsed(prev => {
      localStorage.setItem('sidebar-collapsed', String(!prev))
      return !prev
    })
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <main
        className={`flex-1 min-w-0 min-h-screen overflow-x-hidden bg-[#F8FAFC] transition-all duration-200 ${
          collapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        {children}
      </main>
    </div>
  )
}
