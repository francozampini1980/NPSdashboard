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

export async function POST(request: NextRequest) {
  const authError = await assertDios()
  if (authError) return NextResponse.json(authError, { status: 403 })

  const { email, role } = await request.json()
  if (!email || !role) return NextResponse.json({ error: 'Email y rol son requeridos' }, { status: 400 })
  if (!['visitor', 'editor', 'dios'].includes(role)) {
    return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
  }

  const admin = getAdminClient()

  // Enviar invitación — Supabase crea el usuario y manda el email
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Setear el rol deseado en profiles (el trigger crea el perfil como 'visitor')
  await admin
    .from('profiles')
    .upsert({ id: data.user.id, email, role }, { onConflict: 'id' })

  return NextResponse.json({ ok: true })
}
