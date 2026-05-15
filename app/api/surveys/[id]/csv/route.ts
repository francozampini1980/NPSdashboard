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

function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return ''
  const str = Array.isArray(val) ? val.join(' | ') : String(val)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

// GET /api/surveys/[id]/csv
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await makeSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Date filter from query params
  const { searchParams } = new URL(req.url)
  const from = searchParams.get('from') // YYYY-MM-DD
  const to = searchParams.get('to')     // YYYY-MM-DD

  // Load survey + questions
  const { data: survey, error: sErr } = await supabase
    .from('surveys')
    .select('name, var1_name, var2_name, var3_name, survey_questions(*)')
    .eq('id', id)
    .single()

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 404 })

  const questions = ((survey.survey_questions ?? []) as Record<string, unknown>[])
    .sort((a, b) => (a.position as number) - (b.position as number))
    .filter((q) => q.type !== 'divisor' && q.type !== 'announcement')

  // Load responses + answers (with optional date range)
  let query = supabase
    .from('survey_responses')
    .select('*, survey_answers(*)')
    .eq('survey_id', id)
    .order('completed_at', { ascending: true })

  if (from) query = query.gte('completed_at', `${from}T00:00:00.000Z`)
  if (to)   query = query.lte('completed_at', `${to}T23:59:59.999Z`)

  const { data: responses, error: rErr } = await query

  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })

  const sv = survey as Record<string, unknown>

  // Build CSV
  const headers = [
    'id',
    'timestamp',
    (sv.var1_name as string) || 'var1',
    (sv.var2_name as string) || 'var2',
    (sv.var3_name as string) || 'var3',
    ...questions.map((q) => (q.question as string) || `Pregunta ${q.position}`),
  ]

  const rows: string[][] = (responses ?? []).map((resp: Record<string, unknown>) => {
    const answers = resp.survey_answers as { question_id: string; value: unknown }[]
    const answerMap = Object.fromEntries(
      (answers ?? []).map((a) => [a.question_id, a.value])
    )
    return [
      resp.id as string,
      resp.completed_at as string,
      (resp.var1 as string) ?? '',
      (resp.var2 as string) ?? '',
      (resp.var3 as string) ?? '',
      ...questions.map((q) => escapeCsv(answerMap[q.id as string])),
    ]
  })

  const csv = [
    headers.map(escapeCsv).join(','),
    ...rows.map((r) => r.map(escapeCsv).join(',')),
  ].join('\n')

  const filename = `encuesta-${survey.name?.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
