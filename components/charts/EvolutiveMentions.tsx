'use client'

import { MonthlyNPSData, POSITIVE_TOPICS, NEGATIVE_TOPICS, formatMonthLabel } from '@/types'

interface Props {
  data: MonthlyNPSData[]
  type: 'positive' | 'negative'
}

function getCellStyle(pct: number, type: 'positive' | 'negative'): string {
  if (pct === 0) return 'bg-slate-50 text-slate-300'
  if (type === 'positive') {
    if (pct >= 40) return 'bg-emerald-600 text-white font-semibold'
    if (pct >= 25) return 'bg-emerald-400 text-white font-semibold'
    if (pct >= 15) return 'bg-emerald-200 text-emerald-900'
    return 'bg-emerald-100 text-emerald-700'
  } else {
    if (pct >= 40) return 'bg-red-600 text-white font-semibold'
    if (pct >= 25) return 'bg-red-400 text-white font-semibold'
    if (pct >= 15) return 'bg-red-200 text-red-900'
    return 'bg-red-100 text-red-700'
  }
}

export default function EvolutiveMentions({ data, type }: Props) {
  const topics = type === 'positive' ? POSITIVE_TOPICS : NEGATIVE_TOPICS
  const reasonsKey = type === 'positive' ? 'promotion_reasons' : 'detraction_reasons'
  const groupKey = type === 'positive' ? 'promoters_count' : 'detractors_count'
  const title = type === 'positive' ? 'Evolución motivos de promoción' : 'Evolución motivos de detracción'
  const accentClass = type === 'positive' ? 'text-emerald-700' : 'text-red-700'

  // Build a matrix: rows = topics, cols = months
  const rows = topics.map(topic => {
    const cells = data.map(d => {
      const reasons = d[reasonsKey] as Record<string, number>
      const groupTotal = d[groupKey] as number
      const count = reasons[topic] ?? 0
      const pct = groupTotal > 0 ? Math.round((count / groupTotal) * 100) : 0
      return { pct, count, month: d.month }
    })
    // Skip rows with all zeros
    const hasData = cells.some(c => c.count > 0)
    return { topic, cells, hasData }
  }).filter(r => r.hasData)

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>
        <p className="text-slate-400 text-sm py-6 text-center">Sin datos para el período seleccionado</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 mb-4">
        % sobre {type === 'positive' ? 'promotores' : 'detractores'} del mes · intensidad del color = magnitud
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="text-left text-slate-500 font-medium py-2 pr-4 w-52 sticky left-0 bg-white">
                Motivo
              </th>
              {data.map(d => (
                <th
                  key={d.month}
                  className="text-center text-slate-500 font-medium py-2 px-2 min-w-[64px]"
                >
                  {formatMonthLabel(d.month)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ topic, cells }) => (
              <tr key={topic} className="group">
                <td className="text-slate-700 py-1.5 pr-4 sticky left-0 bg-white group-hover:text-slate-900">
                  {topic}
                </td>
                {cells.map(({ pct, count, month }) => (
                  <td key={month} className="py-1.5 px-1 text-center">
                    <span
                      className={`inline-block w-full rounded px-1 py-1 tabular-nums ${getCellStyle(pct, type)}`}
                      title={`${count} resp.`}
                    >
                      {pct > 0 ? `${pct}%` : '—'}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-400 mt-3">
        Pasá el cursor sobre cada celda para ver la cantidad de respuestas
      </p>
    </div>
  )
}
