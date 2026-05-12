'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import type { Survey, SurveyQuestion, QuestionType } from '@/types/survey'
import type { NPSConfig, ReactionConfig, ChoiceConfig, AnnouncementConfig, NPSLogic, ReactionLogic, DefaultLogic, LogicTarget } from '@/types/survey'

// ---- Question renderers ----

function NPSQuestion({ question, value, onChange }: {
  question: SurveyQuestion
  value: number | null
  onChange: (v: number) => void
}) {
  const config = question.config as NPSConfig
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">{question.question}</h2>
      </div>
      <div className="flex flex-col items-center space-y-4">
        <div className="flex flex-row flex-nowrap justify-between w-full gap-1 sm:gap-2">
          {Array.from({ length: 11 }, (_, i) => i).map(n => (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={`flex-1 h-10 sm:h-12 rounded-lg border-2 font-bold transition-all flex items-center justify-center text-sm sm:text-lg min-w-0 ${
                value === n
                  ? 'border-[#7A288A] bg-[#7A288A] text-white scale-110 shadow-lg z-10'
                  : 'border-gray-200 text-gray-600 hover:border-[#7A288A] hover:text-[#7A288A] bg-white'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="w-full flex justify-between text-xs sm:text-sm text-gray-500 font-medium px-1">
          <span>{config.label_low}</span>
          <span>{config.label_high}</span>
        </div>
      </div>
    </div>
  )
}

const FACE_EMOJIS = ['😠', '😟', '😐', '😊', '😄']

function ReactionQuestion({ question, value, onChange }: {
  question: SurveyQuestion
  value: number | null
  onChange: (v: number) => void
}) {
  const config = question.config as ReactionConfig

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">{question.question}</h2>
      <div className="flex flex-col items-center space-y-4">
        <div className="flex justify-center gap-3 sm:gap-5">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => onChange(n)}
              className={`transition-all flex items-center justify-center font-bold ${
                config.display === 'faces'
                  ? `text-3xl sm:text-4xl ${value === n ? 'scale-125' : 'opacity-60 hover:opacity-100'}`
                  : config.display === 'stars'
                    ? `text-2xl sm:text-3xl ${value !== null && n <= value ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`
                    : `w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 text-xl ${
                        value === n
                          ? 'border-[#7A288A] bg-[#7A288A] text-white scale-110 shadow-lg'
                          : 'border-gray-200 text-gray-600 hover:border-[#7A288A] hover:text-[#7A288A] bg-white'
                      }`
              }`}
            >
              {config.display === 'faces' ? FACE_EMOJIS[n - 1] : config.display === 'stars' ? '★' : n}
            </button>
          ))}
        </div>
        <div className="w-full flex justify-between text-xs sm:text-sm text-gray-500 font-medium max-w-xs">
          <span>{config.label_low}</span>
          <span>{config.label_high}</span>
        </div>
      </div>
    </div>
  )
}

function ShortTextQuestion({ question, value, onChange }: {
  question: SurveyQuestion
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">{question.question}</h2>
      <input
        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#7A288A] focus:ring-2 focus:ring-[#7A288A] focus:ring-opacity-20 outline-none transition-all bg-white text-gray-800"
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={80}
        placeholder="Escribí tu respuesta…"
      />
      <p className="text-xs text-gray-400 text-right">{value.length}/80</p>
    </div>
  )
}

function LongTextQuestion({ question, value, onChange }: {
  question: SurveyQuestion
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">{question.question}</h2>
      <textarea
        className="w-full h-36 border border-gray-300 rounded-lg px-4 py-3 focus:border-[#7A288A] focus:ring-2 focus:ring-[#7A288A] focus:ring-opacity-20 outline-none resize-none transition-all bg-white text-gray-800"
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={500}
        placeholder="Escribí tu comentario aquí…"
      />
      <p className="text-xs text-gray-400 text-right">{value.length}/500</p>
    </div>
  )
}

function SingleChoiceQuestion({ question, value, onChange, shuffled }: {
  question: SurveyQuestion
  value: number | null
  onChange: (v: number) => void
  shuffled: string[]
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-gray-800">{question.question}</h2>
      <div className="space-y-2.5">
        {shuffled.map((opt, i) => (
          <label
            key={i}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              value === i
                ? 'border-[#7A288A] bg-purple-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name={question.id}
              checked={value === i}
              onChange={() => onChange(i)}
              className="accent-[#7A288A]"
            />
            <span className="text-gray-700">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function MultipleChoiceQuestion({ question, value, onChange, shuffled }: {
  question: SurveyQuestion
  value: number[]
  onChange: (v: number[]) => void
  shuffled: string[]
}) {
  const config = question.config as ChoiceConfig
  const max = config.max_selections

  function toggle(i: number) {
    if (value.includes(i)) {
      onChange(value.filter(v => v !== i))
    } else {
      if (max && value.length >= max) return
      onChange([...value, i])
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-bold text-gray-800">{question.question}</h2>
      {max && <p className="text-sm text-gray-500">Seleccioná hasta {max} opciones.</p>}
      <div className="space-y-2.5">
        {shuffled.map((opt, i) => (
          <label
            key={i}
            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
              value.includes(i)
                ? 'border-[#7A288A] bg-purple-50'
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <input
              type="checkbox"
              checked={value.includes(i)}
              onChange={() => toggle(i)}
              className="accent-[#7A288A] rounded"
            />
            <span className="text-gray-700">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function AnnouncementDisplay({ question }: { question: SurveyQuestion }) {
  const config = question.config as AnnouncementConfig
  return (
    <div className="space-y-4">
      {question.question && <h2 className="text-2xl font-bold text-gray-800">{question.question}</h2>}
      <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{config.content}</p>
    </div>
  )
}

function SuccessScreen({ survey, onRedirect }: { survey: Survey; onRedirect: () => void }) {
  const [countdown, setCountdown] = useState<number | null>(survey.thanks_duration_seconds ?? null)

  useEffect(() => {
    // Solo auto-redirige si hay URL y duración configurada
    if (!survey.redirect_url || countdown === null) return
    if (countdown <= 0) { onRedirect(); return }
    const t = setTimeout(() => setCountdown(c => (c ?? 1) - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown, survey.redirect_url, onRedirect])

  return (
    <div className="text-center space-y-8 py-8">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-800">{survey.thanks_title}</h2>
        <p className="text-gray-600 leading-relaxed max-w-lg mx-auto">{survey.thanks_body}</p>
      </div>
      {survey.redirect_url && (
        countdown !== null ? (
          <p className="text-sm text-gray-400">Redirigiendo en {countdown}s…</p>
        ) : (
          <button
            onClick={onRedirect}
            className="mt-2 px-8 py-3 rounded-xl font-semibold bg-[#7A288A] hover:bg-[#5e1e6b] text-white shadow-md shadow-purple-200 transition-all"
          >
            Continuar →
          </button>
        )
      )}
    </div>
  )
}

// ---- Logic resolver ----

function resolveNext(
  question: SurveyQuestion,
  value: unknown,
  questions: SurveyQuestion[]
): string | 'end' | 'next' {
  const logic = question.logic as Record<string, LogicTarget>

  if (question.type === 'nps') {
    const npsLogic = question.logic as NPSLogic
    const v = value as number
    const target = v <= 6 ? npsLogic.detractors : v <= 8 ? npsLogic.neutrals : npsLogic.promoters
    return target
  }

  if (question.type === 'reaction') {
    const rLogic = question.logic as ReactionLogic
    const v = value as number
    const target = v <= 2 ? rLogic.negative : v === 3 ? rLogic.neutral : rLogic.positive
    return target
  }

  return (question.logic as DefaultLogic).default ?? 'next'
}

function getNextQuestionIndex(
  current: number,
  questions: SurveyQuestion[],
  answers: Record<string, unknown>
): number | null {
  const q = questions[current]
  const target = resolveNext(q, answers[q.id], questions)

  if (target === 'end') return null
  if (target === 'next') return current + 1 < questions.length ? current + 1 : null

  const idx = questions.findIndex(x => x.id === target)
  return idx >= 0 ? idx : null
}

// ---- Shuffle helper ----
function shuffleArray<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

// ---- Main page ----

export default function SurveyPage() {
  const { slug } = useParams<{ slug: string }>()
  const searchParams = useSearchParams()
  const var1 = searchParams.get('var1') ?? undefined
  const var2 = searchParams.get('var2') ?? undefined
  const var3 = searchParams.get('var3') ?? undefined

  const [survey, setSurvey] = useState<Survey | null>(null)
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [shuffledOptions, setShuffledOptions] = useState<Record<string, string[]>>({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [history, setHistory] = useState<number[]>([])
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [status, setStatus] = useState<'loading' | 'not_found' | 'closed' | 'active' | 'success'>('loading')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(`/api/public/survey/${slug}`)
      .then(async r => {
        if (r.status === 404) { setStatus('not_found'); return }
        if (r.status === 410) { setStatus('closed'); return }
        if (!r.ok) { setStatus('not_found'); return }
        const data = await r.json()
        setSurvey(data)
        const qs = (data.survey_questions ?? []) as SurveyQuestion[]
        setQuestions(qs)

        // Pre-shuffle choice options
        const opts: Record<string, string[]> = {}
        for (const q of qs) {
          if (q.type === 'single_choice' || q.type === 'multiple_choice') {
            const config = q.config as ChoiceConfig
            opts[q.id] = config.randomize ? shuffleArray(config.options) : config.options
          }
        }
        setShuffledOptions(opts)
        setStatus('active')
      })
      .catch(() => setStatus('not_found'))
  }, [slug])

  const currentQuestion = questions[currentIdx]
  const currentValue = currentQuestion ? answers[currentQuestion.id] : undefined

  function isAnswered(): boolean {
    if (!currentQuestion) return true
    if (currentQuestion.type === 'announcement') return true
    if (!currentQuestion.required) return true
    const v = currentValue
    if (v === null || v === undefined) return false
    if (typeof v === 'string') return v.trim().length > 0
    if (Array.isArray(v)) return v.length > 0
    return true
  }

  function handleAnswer(value: unknown) {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }))
  }

  async function handleNext() {
    const nextIdx = getNextQuestionIndex(currentIdx, questions, answers)

    if (nextIdx === null) {
      // Submit
      setSubmitting(true)
      const answerPayload = Object.entries(answers)
        .filter(([qid]) => questions.find(q => q.id === qid))
        .map(([question_id, value]) => ({ question_id, value }))

      await fetch(`/api/surveys/${survey!.id}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ var1, var2, var3, answers: answerPayload }),
      })
      setSubmitting(false)
      setStatus('success')
    } else {
      setHistory(prev => [...prev, currentIdx])
      setCurrentIdx(nextIdx)
    }
  }

  function handleBack() {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    setCurrentIdx(prev)
  }

  function handleRedirect() {
    if (survey?.redirect_url) window.location.href = survey.redirect_url
  }

  const progress = questions.length > 0
    ? Math.round(((currentIdx) / questions.length) * 100)
    : 0

  // ---- Renders ----

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Cargando encuesta…</p>
      </div>
    )
  }

  if (status === 'not_found') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-2xl font-bold text-gray-700">Encuesta no encontrada</p>
        <p className="text-gray-400 text-sm">El enlace puede ser incorrecto o la encuesta fue desactivada.</p>
      </div>
    )
  }

  if (status === 'closed') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-2xl font-bold text-gray-700">Esta encuesta está cerrada</p>
        <p className="text-gray-400 text-sm">Ya no acepta nuevas respuestas.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start p-4 sm:p-6 font-sans">

      {/* Header — logo */}
      <header className="w-full flex justify-center py-6 mb-4">
        {survey?.header_image_url ? (
          <img
            src={survey.header_image_url}
            alt="Logo"
            className="h-8 sm:h-12 w-auto max-w-[200px] object-contain"
          />
        ) : (
          <div className="h-8 sm:h-12" />
        )}
      </header>

      {/* Progress bar */}
      {status === 'active' && (
        <div className="w-full max-w-2xl bg-gray-200 rounded-full h-2.5 mb-8">
          <div
            className="bg-[#7A288A] h-2.5 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Card */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-8">
        <div className="p-6 sm:p-10">
          {status === 'success' ? (
            <SuccessScreen survey={survey!} onRedirect={handleRedirect} />
          ) : currentQuestion ? (
            <div className="space-y-8">
              {/* Question renderer */}
              {currentQuestion.type === 'nps' && (
                <NPSQuestion
                  question={currentQuestion}
                  value={(currentValue as number) ?? null}
                  onChange={handleAnswer}
                />
              )}
              {currentQuestion.type === 'reaction' && (
                <ReactionQuestion
                  question={currentQuestion}
                  value={(currentValue as number) ?? null}
                  onChange={handleAnswer}
                />
              )}
              {currentQuestion.type === 'short_text' && (
                <ShortTextQuestion
                  question={currentQuestion}
                  value={(currentValue as string) ?? ''}
                  onChange={handleAnswer}
                />
              )}
              {currentQuestion.type === 'long_text' && (
                <LongTextQuestion
                  question={currentQuestion}
                  value={(currentValue as string) ?? ''}
                  onChange={handleAnswer}
                />
              )}
              {currentQuestion.type === 'single_choice' && (
                <SingleChoiceQuestion
                  question={currentQuestion}
                  value={(currentValue as number) ?? null}
                  onChange={handleAnswer}
                  shuffled={shuffledOptions[currentQuestion.id] ?? (currentQuestion.config as ChoiceConfig).options}
                />
              )}
              {currentQuestion.type === 'multiple_choice' && (
                <MultipleChoiceQuestion
                  question={currentQuestion}
                  value={(currentValue as number[]) ?? []}
                  onChange={handleAnswer}
                  shuffled={shuffledOptions[currentQuestion.id] ?? (currentQuestion.config as ChoiceConfig).options}
                />
              )}
              {currentQuestion.type === 'announcement' && (
                <AnnouncementDisplay question={currentQuestion} />
              )}

              {/* Buttons */}
              <div className="pt-4 flex flex-col-reverse sm:flex-row justify-between gap-3">
                <button
                  onClick={handleBack}
                  disabled={history.length === 0}
                  className="px-6 py-3 rounded-lg font-semibold border-2 border-[#7A288A] text-[#7A288A] hover:bg-purple-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  Atrás
                </button>
                <button
                  onClick={handleNext}
                  disabled={!isAnswered() || submitting}
                  className="px-6 py-3 rounded-lg font-semibold bg-[#7A288A] hover:bg-[#5e1e6b] text-white shadow-md shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitting ? 'Enviando…' : getNextQuestionIndex(currentIdx, questions, answers) === null ? 'Enviar' : 'Siguiente'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-10">Esta encuesta no tiene preguntas.</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-400 text-xs max-w-md">
        <p>{survey?.footer_text}</p>
      </div>
    </div>
  )
}
