'use client'

import { MonthlyNPSData, POSITIVE_TOPICS, NEGATIVE_TOPICS, formatMonthLabel } from '@/types'

interface Props {
  data: MonthlyNPSData[]
  type: 'positive' | 'negative'
}

function computeColumnRanks(rows: { cells: { pct: number }[] }[]): number[][] {
  const numCols = rows.length > 0 ? rows[0].cells.length : 0
  // result[colIdx][rowIdx] = 1|2|3 or 0 (not top 3)
  const result: number[][] = Array.from({ length: numCols }, () =>
    new Array(rows.length).fill(0)
  )
  for (let colIdx = 0; colIdx < numCols; colIdx++) {
    const sorted = rows
      .map((row, rowIdx) => ({ rowIdx, pct: row.cells[colIdx].pct }))
      .filter(v => v.pct > 0)
      .sort((a, b) => b.pct - a.pct)
    sorted.slice(0, 3).forEach((v, i) => {
      result[colIdx][v.rowIdx] = i + 1
    })
  }
  return result
}

function getRankStyle(rank: number, pct: number, type: 'positive' | 'negative'): string {
  if (pct === 0) return 'bg-slate-50 text-slate-300'
  if (rank === 0) return 'bg-slate-100 text-slate-500'
  if (type === 'positive') {
    if (rank === 1) return 'bg-emerald-700 text-white font-bold'
    if (rank === 2) return 'bg-emerald-500 text-white font-semibold'
    return 'bg-emerald-200 text-emerald-900 font-medium'
  } else {
    if (rank === 1) return 'bg-red-700 text-white font-bold'
    if (rank === 2) return 'bg-red-500 text-white font-semibold'
    return 'bg-red-200 text-red-900 font-medium'
  }
}

export default function EvolutiveMentions({ data, type }: Props) {
  const topics = type === 'positive' ? POSITIVE_TOPICS : NEGATIVE_TOPICS
  const reasonsKey = type === 'positive' ? 'promotion_reasons' : 'detraction_reasons'
  const groupKey = type === 'positive' ? 'promoters_count' : 'detractors_count'
  const title = type === 'positive' ? 'Evolución motivos de promoción' : 'Evolución motivos de detracción'

  const rows = topics.map(topic => {
    const cells = data.map(d => {
      const reasons = d[reasonsKey] as Record<string, number>
      const groupTotal = d[groupKey] as number
      const count = reasons[topic] ?? 0
      const pct = groupTotal > 0 ? Math.round((count / groupTotal) * 100) : 0
      return { pct, count, month: d.month }
    })
    return { topic, cells, hasData: cells.some(c => c.count > 0) }
  }).filter(r => r.hasData)

  const columnRanks = computeColumnRanks(rows)

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>
        <p className="text-slate-400 text-sm py-6 text-center">Sin datos para el período seleccionado</p>
      </div>
    )
  }

  const rankColor = type === 'positive'
    ? ['bg-emerald-700', 'bg-emerald-500', 'bg-emerald-200']
    : ['bg-red-700', 'bg-red-500', 'bg-red-200']

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
      <div className="flex items-center gap-4 mb-4">
        <p className="text-xs text-slate-400">
          % sobre {type === 'positive' ? 'promotores' : 'detractores'} · top 3 por mes resaltado
        </p>
        <div className="flex items-center gap-2 ml-auto">
          {(['#1', '#2', '#3'] as const).map((label, i) => (
            <span key={label} className="flex items-center gap-1 text-xs text-slate-500">
              <span className={`inline-block w-3 h-3 rounded-sm ${rankColor[i]}`} />
              {label}
            </span>
          ))}
        </div>
      </div>
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
            {rows.map(({ topic, cells }, rowIdx) => (
              <tr key={topic} className="group">
                <td className="text-slate-700 py-1.5 pr-4 sticky left-0 bg-white group-hover:text-slate-900">
                  {topic}
                </td>
                {cells.map(({ pct, count, month }, colIdx) => (
                  <td key={month} className="py-1.5 px-1 text-center">
                    <div className="relative inline-block w-full group/cell">
                      <span className={`inline-block w-full rounded px-1 py-1 tabular-nums ${getRankStyle(columnRanks[colIdx][rowIdx], pct, type)}`}>
                        {pct > 0 ? `${pct}%` : '—'}
                      </span>
                      {count > 0 && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/cell:opacity-100 pointer-events-none transition-opacity z-10">
                          {count} respuestas
                        </div>
                      )}
                    </div>
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
