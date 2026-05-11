'use client'

import { POSITIVE_TOPICS, NEGATIVE_TOPICS } from '@/types'

interface Props {
  reasons: Record<string, number>
  groupTotal: number  // promoters_count for positive, detractors_count for negative
  type: 'positive' | 'negative'
  title: string
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

export default function MentionsBar({ reasons, groupTotal, type, title }: Props) {
  const allowedTopics: readonly string[] = type === 'positive' ? POSITIVE_TOPICS : NEGATIVE_TOPICS

  const rows = allowedTopics
    .map(topic => {
      const count = reasons[topic] ?? 0
      const pct = groupTotal > 0 ? Math.round((count / groupTotal) * 100) : 0
      return { topic, count, pct }
    })
    .filter(r => r.count > 0)
    .sort((a, b) => b.pct - a.pct)
    .map((r, i) => ({ ...r, rank: i < 3 ? i + 1 : 0 }))

  const rankColor = type === 'positive'
    ? ['bg-emerald-700', 'bg-emerald-500', 'bg-emerald-200']
    : ['bg-red-700', 'bg-red-500', 'bg-red-200']

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-base font-semibold text-slate-700 mb-2">{title}</h3>
        <p className="text-slate-400 text-sm py-6 text-center">Sin datos para este mes</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      <div className="flex items-center gap-4 mb-4">
        <p className="text-xs text-slate-400">
          % sobre {groupTotal} {type === 'positive' ? 'promotores' : 'detractores'} · top 3 resaltado
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
      <table className="w-full text-xs border-separate border-spacing-0">
        <tbody>
          {rows.map(({ topic, pct, count, rank }) => (
            <tr key={topic} className="group">
              <td className="text-slate-700 py-1.5 pr-4 group-hover:text-slate-900">
                {topic}
              </td>
              <td className="py-1.5 pl-1 text-center w-16">
                <div className="relative inline-block w-full group/cell">
                  <span className={`inline-block w-full rounded px-2 py-1 tabular-nums ${getRankStyle(rank, pct, type)}`}>
                    {pct > 0 ? `${pct}%` : '—'}
                  </span>
                  {count > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-800 text-white rounded whitespace-nowrap opacity-0 group-hover/cell:opacity-100 pointer-events-none transition-opacity z-10">
                      {count} respuestas
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-slate-400 mt-3">
        Pasá el cursor sobre cada celda para ver la cantidad de respuestas
      </p>
    </div>
  )
}
