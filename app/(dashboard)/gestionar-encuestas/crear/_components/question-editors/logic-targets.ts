import type { BuilderQuestion } from '@/types/survey'

export interface LogicOption { value: string; label: string }

/**
 * Build the list of jump targets for any non-divisor question.
 * Excludes divisors (they'd show as "sin título") and the question itself.
 */
export function buildLogicTargets(
  allQuestions: BuilderQuestion[],
  currentId: string,
): LogicOption[] {
  // Count through ALL non-divisor questions to preserve absolute numbering
  // (same scheme as the card header: 1, 2, 3… skipping divisors)
  let nonDivisorNum = 0
  const questionOptions: LogicOption[] = []

  for (const q of allQuestions) {
    if (q.type === 'divisor') continue
    nonDivisorNum++
    if (q.id === currentId) continue  // skip self but keep the count
    const text = q.question?.trim()
    const label = text
      ? `${text.slice(0, 42)}${text.length > 42 ? '…' : ''}`
      : `Pregunta ${nonDivisorNum}`
    questionOptions.push({ value: q.id, label })
  }

  return [
    { value: 'next', label: 'Siguiente pregunta' },
    { value: 'end',  label: 'Fin de encuesta' },
    ...questionOptions,
  ]
}

/**
 * Build the list of jump targets for a divisor question.
 * Includes other divisors as page jump targets, plus regular questions.
 */
export function buildDivisorTargets(
  allQuestions: BuilderQuestion[],
  currentId: string,
): LogicOption[] {
  let pageNum = 1
  let qNum = 0

  const pageOptions: LogicOption[] = []
  const questionOptions: LogicOption[] = []

  for (const q of allQuestions) {
    if (q.id === currentId) {
      pageNum++ // count current divisor to keep page numbers consistent
      continue
    }
    if (q.type === 'divisor') {
      pageNum++
      pageOptions.push({ value: q.id, label: `Saltar a Página ${pageNum}` })
    } else {
      qNum++
      const text = q.question?.trim()
      questionOptions.push({
        value: q.id,
        label: text ? `Ir a: ${text.slice(0, 38)}${text.length > 38 ? '…' : ''}` : `Ir a: Pregunta ${qNum}`,
      })
    }
  }

  return [
    { value: 'next', label: 'Siguiente página' },
    { value: 'end',  label: 'Fin de encuesta' },
    ...pageOptions,
    ...questionOptions,
  ]
}
