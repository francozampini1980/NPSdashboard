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

  const { email, password, role } = await request.json()

  if (!email || !password || !role) {
    return NextResponse.json({ error: 'Email, contraseña y rol son requeridos' }, { status: 400 })
  }
  if (!['visitor', 'editor', 'dios'].includes(role)) {
    return NextResponse.json({ error: 'Rol inválido' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
  }

  const admin = getAdminClient()

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await admin
    .from('profiles')
    .upsert({ id: data.user.id, email, role }, { onConflict: 'id' })

  return NextResponse.json({ ok: true })
}
