'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Props {
  distribution: Record<string, number>
  total: number
}

function getBarColor(score: number): string {
  if (score >= 9) return '#10B981'
  if (score >= 7) return '#F59E0B'
  return '#EF4444'
}

export default function ScoreDistribution({ distribution, total }: Props) {
  const data = Array.from({ length: 11 }, (_, i) => ({
    score: String(i),
    count: distribution[String(i)] ?? 0,
    pct: total > 0 ? Math.round(((distribution[String(i)] ?? 0) / total) * 100) : 0,
  }))

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-base font-semibold text-slate-700 mb-4">Distribución de valoraciones (0-10)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="score" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(_, __, props) => {
              const p = props?.payload as { pct: number; count: number }
              return [`${p?.pct ?? 0}% (${p?.count ?? 0} resp.)`, 'Respuestas']
            }}
            labelFormatter={l => `Valoración: ${l}`}
          />
          <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
            {data.map(entry => (
              <Cell key={entry.score} fill={getBarColor(Number(entry.score))} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 justify-center mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> 0-6 Detractores</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> 7-8 Neutros</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> 9-10 Promotores</span>
      </div>
    </div>
  )
}
