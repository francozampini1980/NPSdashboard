import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Public route — uses anon key, RLS restricts to active surveys only
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const { data, error } = await supabase
    .from('surveys')
    .select('*, survey_questions(*)')
    .eq('slug', params.slug)
    .eq('status', 'active')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Survey not found or inactive' }, { status: 404 })
  }

  // Check scheduled close
  if (data.close_at && new Date(data.close_at) < new Date()) {
    return NextResponse.json({ error: 'Survey is closed' }, { status: 410 })
  }

  const questions = ((data.survey_questions ?? []) as Record<string, unknown>[]).sort(
    (a, b) => (a.position as number) - (b.position as number)
  )

  return NextResponse.json({ ...data, survey_questions: questions })
}
