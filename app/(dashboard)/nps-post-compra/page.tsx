'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import { getAllMonths } from '@/lib/storage'
import { useEvolutivePage } from '@/lib/hooks/useEvolutivePage'
import { MonthlyNPSData, formatMonthLabelFull } from '@/types'
import NPSScoreCard from '@/components/charts/NPSScoreCard'
import PromoterDonut from '@/components/charts/PromoterDonut'
import ScoreDistribution from '@/components/charts/ScoreDistribution'
import MentionsBar from '@/components/charts/MentionsBar'
import EvolutiveNPS from '@/components/charts/EvolutiveNPS'
import EvolutivePromoters from '@/components/charts/EvolutivePromoters'
import EvolutiveMentions from '@/components/charts/EvolutiveMentions'
import CommentHighlights from '@/components/charts/CommentHighlights'

export default function NPSPostCompraPage() {
  const [activeTab, setActiveTab] = useState<'mes-actual' | 'evolutivo'>('evolutivo')
  const [allMonths, setAllMonths] = useState<MonthlyNPSData[]>([])
  const [loading, setLoading] = useState(true)

  const {
    selectedMonth, setSelectedMonth,
    evolutiveSlice, currentData,
    totalPages, maxPage, safePage: safeEvolutivePage,
    initFromData, goToPrevPage, goToNextPage,
  } = useEvolutivePage(allMonths)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getAllMonths().then(data => {
      if (cancelled) return
      const postPurchase = data.filter(d => d.survey_type === 'post_purchase')
      setAllMonths(postPurchase)
      initFromData(postPurchase)
      setLoading(false)
    }).catch(() => setLoading(false))
    return () => { cancelled = true }
  }, [])

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
        <h2 className="text-2xl font-bold text-slate-800">NPS Post Compra</h2>
        <p className="text-slate-500 text-sm mt-1">Encuesta de experiencia luego de la compra</p>
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

      {/* No data state */}
      {allMonths.length === 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">No hay datos cargados</p>
            <p className="text-sm mt-0.5">
              Andá a <span className="font-semibold">Configuración</span> para cargar tu primer CSV mensual.
            </p>
          </div>
        </div>
      )}

      {/* MES ACTUAL */}
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
              {/* Row 1: KPI + Donut */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <NPSScoreCard
                  nps={currentData.nps_score}
                  totalResponses={currentData.total_responses}
                  impressions={currentData.impressions}
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

              {/* Row 3: Mentions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MentionsBar
                  reasons={currentData.promotion_reasons}
                  groupTotal={currentData.promoters_count}
                  type="positive"
                  title="% Menciones positivas"
                />
                <MentionsBar
                  reasons={currentData.detraction_reasons}
                  groupTotal={currentData.detractors_count}
                  type="negative"
                  title="% Menciones negativas"
                />
              </div>

              <CommentHighlights
                positiveAspects={currentData.positive_aspects}
                negativeAspects={currentData.negative_aspects}
                openComments={currentData.open_comments}
              />
            </div>
          )}
        </div>
      )}

      {/* EVOLUTIVO */}
      {activeTab === 'evolutivo' && allMonths.length > 0 && (
        <div>
          {/* Pagination controls */}
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
                onClick={goToPrevPage}
                disabled={safeEvolutivePage === 0}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-slate-500">
                {safeEvolutivePage + 1} / {Math.max(1, totalPages)}
              </span>
              <button
                onClick={goToNextPage}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EvolutiveNPS data={evolutiveSlice} />
                <EvolutivePromoters data={evolutiveSlice} />
              </div>
              <EvolutiveMentions data={evolutiveSlice} type="positive" />
              <EvolutiveMentions data={evolutiveSlice} type="negative" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
