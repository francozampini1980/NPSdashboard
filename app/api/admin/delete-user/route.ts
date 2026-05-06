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

export async function DELETE(request: NextRequest) {
  const authError = await assertDios()
  if (authError) return NextResponse.json(authError, { status: 403 })

  const { userId } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 })

  const admin = getAdminClient()

  // Verificar que no se elimine a sí mismo
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
  const { data: { user: me } } = await supabase.auth.getUser()
  if (me?.id === userId) {
    return NextResponse.json({ error: 'No podés eliminar tu propia cuenta' }, { status: 400 })
  }

  // El CASCADE en profiles elimina el perfil automáticamente
  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
