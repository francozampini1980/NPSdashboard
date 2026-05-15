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
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  return data?.role as string | null
}

// GET /api/surveys — list all surveys with response count + creator email
export async function GET() {
  const supabase = await makeSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('surveys')
    .select('*, survey_responses(count)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch creator emails from profiles (separate query — no FK to profiles exists)
  const creatorIds = [...new Set((data ?? []).map((s: Record<string, unknown>) => s.created_by as string).filter(Boolean))]
  const emailMap: Record<string, string> = {}
  if (creatorIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', creatorIds)
    for (const p of profiles ?? []) {
      emailMap[(p as Record<string, string>).id] = (p as Record<string, string>).email
    }
  }

  const surveys = (data ?? []).map((s: Record<string, unknown>) => ({
    ...s,
    response_count: (s.survey_responses as { count: number }[])?.[0]?.count ?? 0,
    creator_email: emailMap[s.created_by as string] ?? null,
    survey_responses: undefined,
  }))

  return NextResponse.json(surveys)
}

// POST /api/surveys — create survey + questions
export async function POST(req: Request) {
  const supabase = await makeSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const role = await getRole(supabase, user.id)
  if (!role || !['editor', 'dios'].includes(role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { questions, ...surveyData } = body

  const { data: survey, error: surveyError } = await supabase
    .from('surveys')
    .insert({ ...surveyData, created_by: user.id })
    .select()
    .single()

  if (surveyError) return NextResponse.json({ error: surveyError.message }, { status: 500 })

  if (questions && questions.length > 0) {
    const rows = questions.map((q: Record<string, unknown>, i: number) => ({
      id: q.id,          // preserve client-generated UUID so logic references match
      survey_id: survey.id,
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

  return NextResponse.json(survey, { status: 201 })
}
