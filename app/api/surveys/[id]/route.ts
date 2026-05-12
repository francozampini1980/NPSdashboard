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

async function getRole(supabase: Awaited<ReturnType<typeof makeSupabase>>, userId: string) {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
  return data?.role as string | null
}

// GET /api/surveys/[id] — survey + questions
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await makeSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('surveys')
    .select('*, survey_questions(*)')
    .eq('id', id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })

  const questions = ((data.survey_questions ?? []) as Record<string, unknown>[]).sort(
    (a, b) => (a.position as number) - (b.position as number)
  )

  return NextResponse.json({ ...data, survey_questions: questions })
}

// PUT /api/surveys/[id] — update survey + replace questions
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await makeSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = await getRole(supabase, user.id)
  if (!role || !['editor', 'dios'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { questions, ...surveyData } = body

  // Update survey
  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .update(surveyData)
    .eq('id', id)
    .select()
    .single()

  if (surveyError) return NextResponse.json({ error: surveyError.message }, { status: 500 })

  // Replace questions: delete all, re-insert
  await supabase.from('survey_questions').delete().eq('survey_id', id)

  if (questions && questions.length > 0) {
    const rows = questions.map((q: Record<string, unknown>, i: number) => ({
      survey_id: id,
      position: i,
      type: q.type,
      question: q.question,
      required: q.required,
      config: q.config,
      logic: q.logic,
    }))
    const { error: qError } = await supabase.from('survey_questions').insert(rows)
    if (qError) return NextResponse.json({ error: qError.message }, { status: 500 })
  }

  return NextResponse.json(survey)
}

// DELETE /api/surveys/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await makeSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = await getRole(supabase, user.id)
  if (!role || !['editor', 'dios'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await supabase.from('surveys').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
