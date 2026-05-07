'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { CommentAnalysis, CommentAnalysisTopic } from '@/types'

interface Props {
  surveyType: 'nps_compra' | 'nps_entrega'
  month: string
  totalComments: number
}

const POLL_INTERVAL = 3000

export default function CommentAnalysisPanel({ surveyType, month, totalComments }: Props) {
  const [analysis, setAnalysis] = useState<CommentAnalysis | null>(null)
  const [starting, setStarting] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function fetchStatus() {
    const res = await fetch(`/api/analyze-comments?survey_type=${surveyType}&month=${month}`)
    const data = await res.json()
    return (data.analysis ?? null) as CommentAnalysis | null
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  function startPolling() {
    stopPolling()
    pollRef.current = setInterval(async () => {
      const a = await fetchStatus()
      setAnalysis(a)
      if (a && a.status !== 'pending' && a.status !== 'processing') {
        stopPolling()
      }
    }, POLL_INTERVAL)
  }

  useEffect(() => {
    let cancelled = false
    setLoadingInitial(true)
    fetchStatus().then(a => {
      if (cancelled) return
      setAnalysis(a)
      setLoadingInitial(false)
      if (a && (a.status === 'pending' || a.status === 'processing')) {
        startPolling()
      }
    })
    return () => {
      cancelled = true
      stopPolling()
    }
  }, [surveyType, month])

  async function handleAnalyze() {
    setStarting(true)
    try {
      await fetch('/api/analyze-comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ survey_type: surveyType, month }),
      })
      const a = await fetchStatus()
      setAnalysis(a)
      startPolling()
    } finally {
      setStarting(false)
    }
  }

  if (totalComments === 0) return null

  if (loadingInitial) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
      </div>
    )
  }

  const isProcessing = analysis?.status === 'pending' || analysis?.status === 'processing'

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Sparkles size={15} className="text-blue-600" />
          Análisis de comentarios abiertos
        </h3>
        {analysis?.status === 'done' && (
          <button
            onClick={handleAnalyze}
            disabled={starting}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <RefreshCw size={12} />
            Re-analizar
          </button>
        )}
      </div>

      {/* Sin análisis todavía */}
      {!analysis && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-slate-500">
            Hay <span className="font-medium text-slate-700">{totalComments} comentarios</span> disponibles para analizar con IA.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={starting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {starting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {starting ? 'Iniciando…' : 'Analizar comentarios'}
          </button>
        </div>
      )}

      {/* Procesando */}
      {isProcessing && (
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 size={18} className="animate-spin text-blue-500 shrink-0" />
          <div>
            <p className="text-sm font-medium text-slate-700">Analizando comentarios…</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Esto puede tardar unos segundos
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {analysis?.status === 'error' && (
        <div className="space-y-3">
          <div className="flex items-start gap-2 text-red-600 bg-red-50 rounded-lg p-3">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p className="text-sm">{analysis.error_text ?? 'Error al analizar comentarios'}</p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={starting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {starting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Reintentar
          </button>
        </div>
      )}

      {/* Resultado */}
      {analysis?.status === 'done' && analysis.result && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TopicList
              title="Menciones positivas"
              topics={analysis.result.positivo}
              type="positive"
            />
            <TopicList
              title="Menciones negativas"
              topics={analysis.result.negativo}
              type="negative"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Basado en{' '}
            <span className="font-medium">{analysis.analyzed_comments} comentarios analizados</span>
            {analysis.total_comments !== analysis.analyzed_comments && (
              <> de {analysis.total_comments} totales</>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

function TopicList({ title, topics, type }: {
  title: string
  topics: CommentAnalysisTopic[]
  type: 'positive' | 'negative'
}) {
  const icon = type === 'positive' ? '✅' : '❌'
  const barColor = type === 'positive' ? 'bg-emerald-400' : 'bg-red-400'
  const pctColor = type === 'positive' ? 'text-emerald-700' : 'text-red-600'

  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-600 mb-3">
        {icon} {title}
      </p>
      <ol className="space-y-3">
        {topics.map((t, i) => (
          <li key={i}>
            <div className="flex items-baseline justify-between gap-2 mb-0.5">
              <span className="text-sm font-medium text-slate-800 leading-snug">
                {i + 1}. {t.topico}
              </span>
              <span className={`text-sm font-bold shrink-0 tabular-nums ${pctColor}`}>
                {t.porcentaje}%
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-snug mb-1.5">{t.descripcion}</p>
            <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${Math.min(t.porcentaje, 100)}%` }}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
