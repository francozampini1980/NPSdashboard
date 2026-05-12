'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download } from 'lucide-react'
import type { SurveyQuestion } from '@/types/survey'

interface Answer { question_id: string; value: unknown }
interface Response {
  id: string
  completed_at: string
  var1: string | null
  var2: string | null
  var3: string | null
  survey_answers: Answer[]
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function RespuestasPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [surveyName, setSurveyName] = useState('')
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/surveys/${id}`).then(r => r.json()),
      fetch(`/api/surveys/${id}/responses`).then(r => r.json()),
    ]).then(([survey, resps]) => {
      setSurveyName(survey.name ?? '')
      setQuestions((survey.survey_questions ?? []) as SurveyQuestion[])
      setResponses(resps ?? [])
      setLoading(false)
    })
  }, [id])

  function downloadCsv() {
    window.open(`/api/surveys/${id}/csv`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60 text-slate-400 text-sm">
        Cargando respuestas…
      </div>
    )
  }

  return (
    <div className="p-6 max-w-full mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <button
            onClick={() => router.push('/gestionar-encuestas/encuestas')}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 mb-2 transition-colors"
          >
            <ArrowLeft size={15} /> Encuestas
          </button>
          <h2 className="text-2xl font-bold text-slate-800">{surveyName}</h2>
          <p className="text-slate-500 text-sm mt-1">
            {responses.length.toLocaleString('es-AR')} respuesta{responses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={downloadCsv}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <Download size={15} />
          Descargar CSV
        </button>
      </div>

      {responses.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Todavía no hay respuestas para esta encuesta.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
          <table className="text-xs border-separate border-spacing-0 min-w-max w-full">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white text-left font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 border-b border-slate-100 whitespace-nowrap">
                  Timestamp
                </th>
                <th className="text-left font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 border-b border-slate-100 whitespace-nowrap">Var 1</th>
                <th className="text-left font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 border-b border-slate-100 whitespace-nowrap">Var 2</th>
                <th className="text-left font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 border-b border-slate-100 whitespace-nowrap">Var 3</th>
                {questions.map(q => (
                  <th
                    key={q.id}
                    className="text-left font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 border-b border-slate-100 max-w-[180px]"
                  >
                    <span className="block truncate max-w-[160px]" title={q.question}>
                      {q.question || `Pregunta ${q.position + 1}`}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {responses.map((resp) => {
                const answerMap = Object.fromEntries(
                  (resp.survey_answers ?? []).map(a => [a.question_id, a.value])
                )
                return (
                  <tr key={resp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="sticky left-0 bg-white px-4 py-3 border-b border-slate-50 text-slate-600 whitespace-nowrap group-hover:bg-slate-50">
                      {formatDate(resp.completed_at)}
                    </td>
                    <td className="px-4 py-3 border-b border-slate-50 text-slate-500">{resp.var1 ?? <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3 border-b border-slate-50 text-slate-500">{resp.var2 ?? <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3 border-b border-slate-50 text-slate-500">{resp.var3 ?? <span className="text-slate-300">—</span>}</td>
                    {questions.map(q => (
                      <td key={q.id} className="px-4 py-3 border-b border-slate-50 text-slate-700 max-w-[180px]">
                        <span className="block truncate" title={formatValue(answerMap[q.id])}>
                          {formatValue(answerMap[q.id])}
                        </span>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
