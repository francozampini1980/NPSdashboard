'use client'

interface Props {
  title: string
  question: string
  type: 'CES' | 'CSAT'
  score: number
  goodPct: number
  regularPct: number
  badPct: number
}

const TYPE_STYLE = {
  CES: 'bg-purple-100 text-purple-700',
  CSAT: 'bg-blue-100 text-blue-700',
}

export default function MetricScoreCard({ title, question, type, score, goodPct, regularPct, badPct }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-700">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-snug">{question}</p>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${TYPE_STYLE[type]}`}>
          {type}
        </span>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-4xl font-bold text-slate-800">{score.toFixed(1)}</span>
        <span className="text-sm text-slate-400 mb-1">/ 5</span>
      </div>

      {/* Stacked segment bar */}
      <div className="space-y-2">
        <div className="flex h-5 rounded-full overflow-hidden bg-slate-100">
          {goodPct > 0 && (
            <div
              className="bg-emerald-500 flex items-center justify-center transition-all"
              style={{ width: `${goodPct}%` }}
            >
              {goodPct >= 12 && (
                <span className="text-[10px] font-bold text-white">{Math.round(goodPct)}%</span>
              )}
            </div>
          )}
          {regularPct > 0 && (
            <div
              className="bg-amber-400 flex items-center justify-center transition-all"
              style={{ width: `${regularPct}%` }}
            >
              {regularPct >= 12 && (
                <span className="text-[10px] font-bold text-white">{Math.round(regularPct)}%</span>
              )}
            </div>
          )}
          {badPct > 0 && (
            <div
              className="bg-red-400 flex items-center justify-center transition-all"
              style={{ width: `${badPct}%` }}
            >
              {badPct >= 12 && (
                <span className="text-[10px] font-bold text-white">{Math.round(badPct)}%</span>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />
            Buenas {goodPct.toFixed(1)}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" />
            Regulares {regularPct.toFixed(1)}%
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-red-400 inline-block" />
            Malas {badPct.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  )
}
