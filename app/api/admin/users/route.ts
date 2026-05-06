import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getAdminClient } from '@/lib/supabase-admin'

// Verifica que el llamador sea 'dios'
async function assertDios(): Promise<{ error: string } | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'dios') return { error: 'Sin permisos' }
  return null
}

export async function GET() {
  const authError = await assertDios()
  if (authError) return NextResponse.json(authError, { status: 403 })

  const admin = getAdminClient()
  const { data, error } = await admin.auth.admin.listUsers()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Obtener roles de la tabla profiles
  const { data: profiles } = await admin.from('profiles').select('id, role')
  const roleMap = new Map((profiles ?? []).map(p => [p.id, p.role]))

  const users = data.users.map(u => ({
    id: u.id,
    email: u.email ?? '',
    role: roleMap.get(u.id) ?? 'visitor',
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
  }))

  return NextResponse.json({ users })
}
