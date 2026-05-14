'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, AlertCircle, TrendingUp } from 'lucide-react'
import { getAllMonths } from '@/lib/storage'
import { getAllPostEntregaMonths } from '@/lib/storage-post-entrega'
import { useEvolutivePage } from '@/lib/hooks/useEvolutivePage'
import {
  MonthlyNPSData,
  PostEntregaMonthlyData,
  getNPSColor,
  getNPSLabel,
  formatMonthLabelFull,
} from '@/types'
import { getErrorMessage } from '@/lib/utils'
import EvolutiveNPS from '@/components/charts/EvolutiveNPS'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function top3Mentions(
  reasons: Record<string, number>,
  groupTotal: number
): { name: string; pct: number }[] {
  if (!reasons || groupTotal === 0) return []
  return Object.entries(reasons)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, count]) => ({
      name,
      pct: Math.round((count / groupTotal) * 100),
    }))
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function HeroNPS({ nps, month }: { nps: number; month: string }) {
  const color = getNPSColor(nps)
  const label = getNPSLabel(nps)
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center min-h-[140px]">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
        NPS Score · {formatMonthLabelFull(month)}
      </p>
      <div
        className="text-6xl font-extrabold leading-none mt-1"
        style={{ color }}
      >
        {nps > 0 ? `+${nps}` : nps}
      </div>
      <span
        className="mt-3 text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ backgroundColor: `${color}18`, color }}
      >
        {label}
      </span>
    </div>
  )
}

function MentionsRanking({
  title,
  items,
  type,
}: {
  title: string
  items: { name: string; pct: number }[]
  type: 'positive' | 'negative'
}) {
  const accent = type === 'positive' ? '#10B981' : '#EF4444'
  const bg = type === 'positive' ? '#F0FDF4' : '#FEF2F2'

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-slate-400 italic">Sin datos</p>
      ) : (
        <ol className="space-y-2">
          {items.map((item, i) => (
            <li key={item.name} className="flex items-center gap-3">
              {/* Rank badge */}
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ backgroundColor: bg, color: accent }}
              >
                {i + 1}
              </span>
              {/* Name */}
              <span className="text-xs text-slate-700 flex-1 leading-snug">
                {item.name}
              </span>
              {/* Percentage */}
              <span
                className="text-xs font-bold shrink-0"
                style={{ color: accent }}
              >
                {item.pct}%
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function MetricPill({
  label,
  score,
  month,
}: {
  label: string
  score: number
  month: string
}) {
  // CES/CSAT score out of 5, use a neutral color scale
  const color =
    score >= 4 ? '#10B981' : score >= 3 ? '#F59E0B' : '#EF4444'

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col items-center text-center gap-1">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-tight">
        {label}
      </p>
      <p className="text-[10px] text-slate-400">{formatMonthLabelFull(month)}</p>
      <div className="text-3xl font-extrabold mt-1" style={{ color }}>
        {score.toFixed(1)}
      </div>
      <p className="text-[10px] text-slate-400">/ 5</p>
    </div>
  )
}

function EvolutivePaginator({
  label,
  slice,
  safePage,
  totalPages,
  maxPage,
  goToPrevPage,
  goToNextPage,
}: {
  label: string
  slice: { month: string }[]
  safePage: number
  totalPages: number
  maxPage: number
  goToPrevPage: () => void
  goToNextPage: () => void
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-slate-500">
        {label}{' '}
        <span className="font-medium text-slate-700">
          {slice.length > 0
            ? `${formatMonthLabelFull(slice[0].month)} – ${formatMonthLabelFull(slice[slice.length - 1].month)}`
            : '—'}
        </span>
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={goToPrevPage}
          disabled={safePage === 0}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={15} />
        </button>
        <span className="text-xs text-slate-500">
          {safePage + 1} / {Math.max(1, totalPages)}
        </span>
        <button
          onClick={goToNextPage}
          disabled={safePage >= maxPage}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1 h-6 rounded-full bg-[#871ee3]" />
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 mb-4">
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────

export default function ResumenGeneralPage() {
  // ── Post Compra ──
  const [pcMonths, setPcMonths] = useState<MonthlyNPSData[]>([])
  const [pcLoading, setPcLoading] = useState(true)
  const [pcError, setPcError] = useState<string | null>(null)

  const pcEvolutive = useEvolutivePage(pcMonths)
  const pcLatest = pcMonths.length > 0 ? pcMonths[pcMonths.length - 1] : null

  // ── Post Entrega ──
  const [peMonths, setPeMonths] = useState<PostEntregaMonthlyData[]>([])
  const [peLoading, setPeLoading] = useState(true)
  const [peError, setPeError] = useState<string | null>(null)

  const peEvolutive = useEvolutivePage(peMonths)
  const peLatest = peMonths.length > 0 ? peMonths[peMonths.length - 1] : null

  useEffect(() => {
    let cancelled = false
    getAllMonths()
      .then(data => {
        if (cancelled) return
        const pp = data.filter(d => d.survey_type === 'post_purchase')
        setPcMonths(pp)
        pcEvolutive.initFromData(pp)
        setPcLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        setPcError(getErrorMessage(err, 'No se pudieron cargar los datos de Post Compra.'))
        setPcLoading(false)
      })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let cancelled = false
    getAllPostEntregaMonths()
      .then(data => {
        if (cancelled) return
        setPeMonths(data)
        peEvolutive.initFromData(data)
        setPeLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        setPeError(getErrorMessage(err, 'No se pudieron cargar los datos de Post Entrega.'))
        setPeLoading(false)
      })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isLoading = pcLoading || peLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400 text-sm">Cargando resumen...</div>
      </div>
    )
  }

  // ── Mentions ──
  const pcPositiveMentions = pcLatest
    ? top3Mentions(pcLatest.promotion_reasons, pcLatest.promoters_count)
    : []
  const pcNegativeMentions = pcLatest
    ? top3Mentions(pcLatest.detraction_reasons, pcLatest.detractors_count)
    : []

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">
      {/* Page header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={22} className="text-[#871ee3]" />
          <h1 className="text-2xl font-bold text-slate-800">Resumen general</h1>
        </div>
        <p className="text-slate-500 text-sm max-w-2xl">
          Vista consolidada de los principales indicadores de experiencia del cliente.
        </p>
      </div>

      {/* ══════════════════════════════════ */}
      {/* MODULE 1 — NPS Post Compra        */}
      {/* ══════════════════════════════════ */}
      <section>
        <SectionDivider title="NPS Post Compra" />

        {pcError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-4">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="text-sm">{pcError}</p>
          </div>
        )}

        {!pcError && pcMonths.length === 0 && (
          <EmptyState message="No hay datos de Post Compra. Cargá un CSV en Configuración." />
        )}

        {!pcError && pcLatest && (
          <div className="space-y-4">
            {/* Hero + mentions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <HeroNPS nps={pcLatest.nps_score} month={pcLatest.month} />
              <MentionsRanking
                title="Top menciones positivas"
                items={pcPositiveMentions}
                type="positive"
              />
              <MentionsRanking
                title="Top menciones negativas"
                items={pcNegativeMentions}
                type="negative"
              />
            </div>

            {/* Evolutive chart */}
            {pcEvolutive.evolutiveSlice.length >= 2 ? (
              <div>
                <EvolutivePaginator
                  label="Evolutivo:"
                  slice={pcEvolutive.evolutiveSlice}
                  safePage={pcEvolutive.safePage}
                  totalPages={pcEvolutive.totalPages}
                  maxPage={pcEvolutive.maxPage}
                  goToPrevPage={pcEvolutive.goToPrevPage}
                  goToNextPage={pcEvolutive.goToNextPage}
                />
                <EvolutiveNPS data={pcEvolutive.evolutiveSlice} />
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-xs text-slate-400 italic">
                  Necesitás al menos 2 meses para ver el evolutivo.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ══════════════════════════════════ */}
      {/* MODULE 2 — NPS Post Entrega       */}
      {/* ══════════════════════════════════ */}
      <section>
        <SectionDivider title="NPS Post Entrega" />

        {peError && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-4">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <p className="text-sm">{peError}</p>
          </div>
        )}

        {!peError && peMonths.length === 0 && (
          <EmptyState message="No hay datos de Post Entrega. Cargá un CSV en Configuración → NPS Post Entrega." />
        )}

        {!peError && peLatest && (
          <div className="space-y-4">
            {/* NPS hero + metric pills */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="col-span-2 md:col-span-1">
                <HeroNPS nps={peLatest.nps_score} month={peLatest.month} />
              </div>
              <MetricPill
                label="CES — Seguimiento del pedido"
                score={peLatest.ces_score}
                month={peLatest.month}
              />
              <MetricPill
                label="CSAT — Puntualidad de la entrega"
                score={peLatest.csat_puntualidad_score}
                month={peLatest.month}
              />
              <MetricPill
                label="CSAT — Predisposición del transportista"
                score={peLatest.csat_predisposicion_score}
                month={peLatest.month}
              />
              <MetricPill
                label="CSAT — Condición del producto"
                score={peLatest.csat_condicion_score}
                month={peLatest.month}
              />
            </div>

            {/* Evolutive chart */}
            {peEvolutive.evolutiveSlice.length >= 2 ? (
              <div>
                <EvolutivePaginator
                  label="Evolutivo:"
                  slice={peEvolutive.evolutiveSlice}
                  safePage={peEvolutive.safePage}
                  totalPages={peEvolutive.totalPages}
                  maxPage={peEvolutive.maxPage}
                  goToPrevPage={peEvolutive.goToPrevPage}
                  goToNextPage={peEvolutive.goToNextPage}
                />
                <EvolutiveNPS data={peEvolutive.evolutiveSlice} />
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-xs text-slate-400 italic">
                  Necesitás al menos 2 meses para ver el evolutivo.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
