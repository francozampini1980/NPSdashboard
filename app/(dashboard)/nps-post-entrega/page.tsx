'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { getAllPostEntregaMonths } from '@/lib/storage-post-entrega'
import { PostEntregaMonthlyData, formatMonthLabelFull } from '@/types'
import NPSScoreCard from '@/components/charts/NPSScoreCard'
import PromoterDonut from '@/components/charts/PromoterDonut'
import ScoreDistribution from '@/components/charts/ScoreDistribution'
import MetricScoreCard from '@/components/charts/MetricScoreCard'
import EvolutiveNPS from '@/components/charts/EvolutiveNPS'
import EvolutivePromoters from '@/components/charts/EvolutivePromoters'
import EvolutiveMetric from '@/components/charts/EvolutiveMetric'

const MONTHS_PER_PAGE = 6

export default function NPSPostEntregaPage() {
  const [activeTab, setActiveTab] = useState<'mes-actual' | 'evolutivo'>('evolutivo')
  const [allMonths, setAllMonths] = useState<PostEntregaMonthlyData[]>([])
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [evolutivePage, setEvolutivePage] = useState(0)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllPostEntregaMonths()
      setAllMonths(data)
      if (data.length > 0) {
        if (!selectedMonth) setSelectedMonth(data[data.length - 1].month)
        const totalPages = Math.ceil(data.length / MONTHS_PER_PAGE)
        setEvolutivePage(Math.max(0, totalPages - 1))
      }
    } finally {
      setLoading(false)
    }
  }, [selectedMonth])

  useEffect(() => {
    loadData()
  }, [])

  const currentData = allMonths.find(m => m.month === selectedMonth) ?? null

  const totalPages = Math.ceil(allMonths.length / MONTHS_PER_PAGE)
  const maxPage = Math.max(0, totalPages - 1)
  const safeEvolutivePage = Math.min(evolutivePage, maxPage)
  const evolutiveSlice = allMonths.slice(
    safeEvolutivePage * MONTHS_PER_PAGE,
    safeEvolutivePage * MONTHS_PER_PAGE + MONTHS_PER_PAGE
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-400 text-sm">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">NPS Post Entrega</h2>
        <p className="text-slate-500 text-sm mt-1">Encuesta de experiencia luego de la entrega</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit mb-6">
        {([['mes-actual', 'Mes actual'], ['evolutivo', 'Evolutivo']] as const).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setActiveTab(val)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === val
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* No data */}
      {allMonths.length === 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">No hay datos cargados</p>
            <p className="text-sm mt-0.5">
              Andá a <span className="font-semibold">Configuración</span> → pestaña{' '}
              <span className="font-semibold">NPS Post Entrega</span> para cargar tu primer CSV mensual.
            </p>
          </div>
        </div>
      )}

      {/* ── MES ACTUAL ── */}
      {activeTab === 'mes-actual' && allMonths.length > 0 && (
        <div>
          {/* Month selector */}
          <div className="flex items-center gap-3 mb-6">
            <label className="text-sm text-slate-600 font-medium">Mes visualizado:</label>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              {[...allMonths].reverse().map(m => (
                <option key={m.month} value={m.month}>
                  {formatMonthLabelFull(m.month)}
                </option>
              ))}
            </select>
          </div>

          {currentData && (
            <div className="space-y-4">
              {/* Row 1: NPS KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NPSScoreCard
                  nps={currentData.nps_score}
                  totalResponses={currentData.total_responses}
                  impressions={currentData.sent_count}
                />
                <PromoterDonut
                  promoters={currentData.promoters_count}
                  neutrals={currentData.neutrals_count}
                  detractors={currentData.detractors_count}
                  total={currentData.total_responses}
                />
              </div>

              {/* Row 2: Score distribution */}
              <ScoreDistribution
                distribution={currentData.score_distribution}
                total={currentData.total_responses}
              />

              {/* Section: CES */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Seguimiento del pedido
                </h3>
                <MetricScoreCard
                  title="Seguimiento del pedido"
                  question="¿Qué tan fácil fue realizar el seguimiento de tu pedido a través de la plataforma de Frávega?"
                  type="CES"
                  score={currentData.ces_score}
                  goodPct={currentData.ces_good_pct}
                  regularPct={currentData.ces_regular_pct}
                  badPct={currentData.ces_bad_pct}
                />
              </div>

              {/* Section: CSAT */}
              <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  Satisfacción con la entrega
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  ¿Qué tan satisfecho estás respecto a los temas mencionados debajo?
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricScoreCard
                    title="Puntualidad de la entrega"
                    question="Puntualidad de la entrega de tu producto"
                    type="CSAT"
                    score={currentData.csat_puntualidad_score}
                    goodPct={currentData.csat_puntualidad_good_pct}
                    regularPct={currentData.csat_puntualidad_regular_pct}
                    badPct={currentData.csat_puntualidad_bad_pct}
                  />
                  <MetricScoreCard
                    title="Predisposición del transportista"
                    question="Predisposición del transportista"
                    type="CSAT"
                    score={currentData.csat_predisposicion_score}
                    goodPct={currentData.csat_predisposicion_good_pct}
                    regularPct={currentData.csat_predisposicion_regular_pct}
                    badPct={currentData.csat_predisposicion_bad_pct}
                  />
                  <MetricScoreCard
                    title="Condición del producto"
                    question="Condición en la que recibiste el producto"
                    type="CSAT"
                    score={currentData.csat_condicion_score}
                    goodPct={currentData.csat_condicion_good_pct}
                    regularPct={currentData.csat_condicion_regular_pct}
                    badPct={currentData.csat_condicion_bad_pct}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EVOLUTIVO ── */}
      {activeTab === 'evolutivo' && allMonths.length > 0 && (
        <div>
          {/* Pagination */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500">
              Mostrando{' '}
              <span className="font-medium text-slate-700">
                {evolutiveSlice.length > 0
                  ? `${formatMonthLabelFull(evolutiveSlice[0].month)} – ${formatMonthLabelFull(evolutiveSlice[evolutiveSlice.length - 1].month)}`
                  : '—'}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEvolutivePage(p => Math.max(0, p - 1))}
                disabled={safeEvolutivePage === 0}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-slate-500">
                {safeEvolutivePage + 1} / {Math.max(1, totalPages)}
              </span>
              <button
                onClick={() => setEvolutivePage(p => Math.min(maxPage, p + 1))}
                disabled={safeEvolutivePage >= maxPage}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {evolutiveSlice.length < 2 && (
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-700 mb-4">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="text-sm">Necesitás al menos 2 meses cargados para ver el evolutivo.</p>
            </div>
          )}

          {evolutiveSlice.length >= 2 && (
            <div className="space-y-4">
              {/* NPS evolutivo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EvolutiveNPS data={evolutiveSlice} />
                <EvolutivePromoters data={evolutiveSlice} />
              </div>

              {/* CES y CSAT evolutivos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EvolutiveMetric
                  data={evolutiveSlice}
                  title="Evolución Seguimiento del pedido (CES)"
                  dataKey="ces_score"
                  color="#8B5CF6"
                />
                <EvolutiveMetric
                  data={evolutiveSlice}
                  title="Evolución Puntualidad de la entrega (CSAT)"
                  dataKey="csat_puntualidad_score"
                  color="#3B82F6"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EvolutiveMetric
                  data={evolutiveSlice}
                  title="Evolución Predisposición del transportista (CSAT)"
                  dataKey="csat_predisposicion_score"
                  color="#10B981"
                />
                <EvolutiveMetric
                  data={evolutiveSlice}
                  title="Evolución Condición del producto (CSAT)"
                  dataKey="csat_condicion_score"
                  color="#F59E0B"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
