'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Download, CalendarRange, X } from 'lucide-react'
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

// YYYY-MM-DD from Date
function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default function RespuestasPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [surveyName, setSurveyName] = useState('')
  const [questions, setQuestions] = useState<SurveyQuestion[]>([])
  const [responses, setResponses] = useState<Response[]>([])
  const [loading, setLoading] = useState(true)

  // Date filter state
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

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

  // Filtered responses
  const filtered = useMemo(() => {
    return responses.filter(r => {
      const ts = new Date(r.completed_at)
      if (dateFrom) {
        const from = new Date(dateFrom)
        from.setHours(0, 0, 0, 0)
        if (ts < from) return false
      }
      if (dateTo) {
        const to = new Date(dateTo)
        to.setHours(23, 59, 59, 999)
        if (ts > to) return false
      }
      return true
    })
  }, [responses, dateFrom, dateTo])

  const hasFilter = dateFrom || dateTo

  function clearFilter() {
    setDateFrom('')
    setDateTo('')
  }

  function downloadCsv() {
    const params = new URLSearchParams()
    if (dateFrom) params.set('from', dateFrom)
    if (dateTo) params.set('to', dateTo)
    const qs = params.toString()
    window.open(`/api/surveys/${id}/csv${qs ? `?${qs}` : ''}`, '_blank')
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
            {filtered.length.toLocaleString('es-AR')}
            {hasFilter ? ` de ${responses.length.toLocaleString('es-AR')}` : ''}{' '}
            respuesta{filtered.length !== 1 ? 's' : ''}
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

      {/* Date filter */}
      <div className="flex flex-wrap items-end gap-3 mb-5 p-4 bg-white border border-slate-200 rounded-xl">
        <CalendarRange size={16} className="text-slate-400 mb-2 hidden sm:block" />
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Desde</label>
          <input
            type="date"
            value={dateFrom}
            max={dateTo || toDateStr(new Date())}
            onChange={e => setDateFrom(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Hasta</label>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            max={toDateStr(new Date())}
            onChange={e => setDateTo(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
        {hasFilter && (
          <button
            onClick={clearFilter}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <X size={14} />
            Limpiar
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          {responses.length === 0
            ? 'Todavía no hay respuestas para esta encuesta.'
            : 'Sin respuestas en el rango de fechas seleccionado.'}
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
              {filtered.map((resp) => {
                const answerMap = Object.fromEntries(
                  (resp.survey_answers ?? []).map(a => [a.question_id, a.value])
                )
                return (
                  <tr key={resp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="sticky left-0 bg-white px-4 py-3 border-b border-slate-50 text-slate-600 whitespace-nowrap">
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
