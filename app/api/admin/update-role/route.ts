import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getAdminClient } from '@/lib/supabase-admin'

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

export async function PATCH(request: NextRequest) {
  const authError = await assertDios()
  if (authError) return NextResponse.json(authError, { status: 403 })

  const { userId, role } = await request.json()
  if (!userId || !role) return NextResponse.json({ error: 'userId y role requeridos' }, { status: 400 })
  if (!['visitor', 'editor', 'dios'].includes(role)) {
    return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
  }

  const admin = getAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({ role })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
