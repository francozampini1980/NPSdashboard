'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { getSupabaseClient } from './supabase'

export type Role = 'visitor' | 'editor' | 'dios'

interface AuthContextValue {
  user: User | null
  role: Role | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchRole(userId: string): Promise<Role> {
    const supabase = getSupabaseClient()
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    return (data?.role as Role) ?? 'visitor'
  }

  useEffect(() => {
    const supabase = getSupabaseClient()

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const r = await fetchRole(session.user.id)
        setRole(r)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const r = await fetchRole(session.user.id)
          setRole(r)
        } else {
          setRole(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    const supabase = getSupabaseClient()
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
