import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getAdminClient } from '@/lib/supabase-admin'
import Anthropic from '@anthropic-ai/sdk'

const MAX_COMMENTS = 400

const SYSTEM_PROMPT = `Sos un analista de experiencia de cliente.
Vas a recibir comentarios de clientes en español de una encuesta NPS.
Tu tarea: identificar los 5 temas más frecuentes positivos y los 5 más frecuentes negativos.
Respondé ÚNICAMENTE con JSON válido, sin texto adicional, sin markdown.
Formato exacto:
{
  "positivo": [
    { "topico": "2-4 palabras", "descripcion": "1 oración", "porcentaje": number }
  ],
  "negativo": [
    { "topico": "2-4 palabras", "descripcion": "1 oración", "porcentaje": number }
  ]
}
Los porcentajes son aproximados dentro de cada grupo (positivo y negativo por separado).
Si no hay suficientes comentarios negativos para 5 temas, devolvé los que puedas.`

async function getAuthenticatedRole(cookieStore: Awaited<ReturnType<typeof cookies>>) {
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
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile?.role ?? null
}

// GET — polling: devuelve el registro de comment_analysis para survey_type + month
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const role = await getAuthenticatedRole(cookieStore)
  if (!role) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const survey_type = searchParams.get('survey_type')
  const month = searchParams.get('month')

  if (!survey_type || !month) {
    return NextResponse.json({ error: 'survey_type y month son requeridos' }, { status: 400 })
  }

  const admin = getAdminClient()
  const { data, error } = await admin
    .from('comment_analysis')
    .select('*')
    .eq('survey_type', survey_type)
    .eq('month', month)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ analysis: data })
}

// POST — dispara el análisis de comentarios
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const role = await getAuthenticatedRole(cookieStore)
  if (!role) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const { survey_type, month } = await request.json()

  if (!survey_type || !month) {
    return NextResponse.json({ error: 'survey_type y month son requeridos' }, { status: 400 })
  }
  if (!['nps_compra', 'nps_entrega'].includes(survey_type)) {
    return NextResponse.json({ error: 'survey_type inválido' }, { status: 400 })
  }

  const admin = getAdminClient()

  // Leer open_comments de la tabla correspondiente
  const table = survey_type === 'nps_compra' ? 'nps_monthly_data' : 'nps_post_entrega_monthly'
  const query = admin.from(table).select('open_comments').eq('month', month)
  if (survey_type === 'nps_compra') {
    query.eq('survey_type', 'post_purchase')
  }
  const { data: row, error: fetchError } = await query.maybeSingle()

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  const allComments: string[] = row?.open_comments ?? []
  if (allComments.length === 0) {
    return NextResponse.json({ error: 'No hay comentarios para analizar' }, { status: 400 })
  }

  // Sampleo aleatorio si supera el máximo
  const sample = allComments.length <= MAX_COMMENTS
    ? allComments
    : shuffleSample(allComments, MAX_COMMENTS)

  // Crear/actualizar registro en processing
  const { error: upsertError } = await admin.from('comment_analysis').upsert(
    {
      survey_type,
      month,
      status: 'processing',
      total_comments: allComments.length,
      analyzed_comments: sample.length,
      result: null,
      error_text: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'survey_type,month' }
  )
  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 })

  // Llamar a Claude de forma asíncrona (no bloqueamos la respuesta)
  runAnalysis(admin, survey_type, month, sample)

  return NextResponse.json({ ok: true, total: allComments.length, analyzing: sample.length })
}

function shuffleSample<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

async function runAnalysis(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  survey_type: string,
  month: string,
  comments: string[]
) {
  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analizá los siguientes ${comments.length} comentarios de clientes:\n\n${comments.join('\n---\n')}`,
        },
      ],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
    const result = JSON.parse(rawText)

    await admin.from('comment_analysis').upsert(
      {
        survey_type,
        month,
        status: 'done',
        result,
        error_text: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'survey_type,month' }
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido'
    await admin.from('comment_analysis').upsert(
      {
        survey_type,
        month,
        status: 'error',
        error_text: msg,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'survey_type,month' }
    )
  }
}
