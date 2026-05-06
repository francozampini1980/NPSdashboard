'use client'

import { getNPSColor, getNPSLabel } from '@/types'

interface Props {
  nps: number
  totalResponses: number
  impressions: number
}

export default function NPSScoreCard({ nps, totalResponses, impressions }: Props) {
  const color = getNPSColor(nps)
  const label = getNPSLabel(nps)
  const responseRate = impressions > 0 ? ((totalResponses / impressions) * 100).toFixed(1) : null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-4">
      {/* NPS Score */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">NPS Score</p>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold" style={{ color }}>
              {nps > 0 ? `+${nps}` : nps}
            </span>
            <span
              className="text-sm font-medium px-2 py-0.5 rounded-full mb-2"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {label}
            </span>
          </div>
        </div>

        {/* Visual arc indicator */}
        <div className="relative w-20 h-20">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="32" fill="none" stroke="#E2E8F0" strokeWidth="8" />
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeDasharray={`${Math.max(0, ((nps + 100) / 200) * 201)} 201`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-slate-600">
              {nps > 0 ? `+${nps}` : nps}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Total respuestas</p>
          <p className="text-xl font-bold text-slate-800">{totalResponses.toLocaleString('es')}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Tasa de respuesta</p>
          {responseRate ? (
            <p className="text-xl font-bold text-slate-800">{responseRate}%</p>
          ) : (
            <p className="text-sm text-slate-400 italic">Sin impresiones cargadas</p>
          )}
        </div>
      </div>
    </div>
  )
}
