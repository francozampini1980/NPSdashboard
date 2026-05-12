import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

async function makeSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )
}

// GET /api/surveys/[id]/responses — list responses with answers
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = await makeSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('survey_responses')
    .select('*, survey_answers(*)')
    .eq('survey_id', params.id)
    .order('completed_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/surveys/[id]/responses — submit a completed survey (public, no auth)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  // Use anon client for public submission
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const body = await req.json()
  const { var1, var2, var3, answers } = body

  // Insert response
  const { data: response, error: respError } = await supabase
    .from('survey_responses')
    .insert({ survey_id: params.id, var1, var2, var3 })
    .select()
    .single()

  if (respError) return NextResponse.json({ error: respError.message }, { status: 500 })

  // Insert answers
  if (answers && answers.length > 0) {
    const rows = answers.map((a: { question_id: string; value: unknown }) => ({
      response_id: response.id,
      question_id: a.question_id,
      value: a.value,
    }))
    const { error: ansError } = await supabase.from('survey_answers').insert(rows)
    if (ansError) return NextResponse.json({ error: ansError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: response.id }, { status: 201 })
}
