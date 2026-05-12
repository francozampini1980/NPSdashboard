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
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = await makeSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Load survey + questions
  const { data: survey, error: sErr } = await supabase
    .from('surveys')
    .select('name, survey_questions(*)')
    .eq('id', params.id)
    .single()

  if (sErr) return NextResponse.json({ error: sErr.message }, { status: 404 })

  const questions = ((survey.survey_questions ?? []) as Record<string, unknown>[]).sort(
    (a, b) => (a.position as number) - (b.position as number)
  )

  // Load responses + answers
  const { data: responses, error: rErr } = await supabase
    .from('survey_responses')
    .select('*, survey_answers(*)')
    .eq('survey_id', params.id)
    .order('completed_at', { ascending: true })

  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 })

  // Build CSV
  const headers = [
    'id',
    'timestamp',
    'var1',
    'var2',
    'var3',
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
