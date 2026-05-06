'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { POSITIVE_TOPICS, NEGATIVE_TOPICS } from '@/types'

interface Props {
  reasons: Record<string, number>
  groupTotal: number  // promoters_count for positive, detractors_count for negative
  type: 'positive' | 'negative'
  title: string
}

export default function MentionsBar({ reasons, groupTotal, type, title }: Props) {
  const allowedTopics: readonly string[] = type === 'positive' ? POSITIVE_TOPICS : NEGATIVE_TOPICS

  const data = Object.entries(reasons)
    // Only show predefined topics — never display free-text or unknown categories
    .filter(([name]) => allowedTopics.includes(name))
    .map(([name, count]) => ({
      name: name.length > 32 ? name.slice(0, 30) + '…' : name,
      fullName: name,
      count,
      // % independent per category: how many in the group selected this reason
      pct: groupTotal > 0 ? Math.round((count / groupTotal) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .filter(d => d.count > 0)

  const color = type === 'positive' ? '#10B981' : '#EF4444'
  const emptyColor = type === 'positive' ? '#D1FAE5' : '#FEE2E2'

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>
        <div className="h-40 flex items-center justify-center">
          <p className="text-slate-400 text-sm">Sin datos para este mes</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-xs text-slate-400 mb-4">
        % sobre {groupTotal} {type === 'positive' ? 'promotores' : 'detractores'}
      </p>
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 36)}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 50, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
          <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 100]} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11 }}
            width={165}
          />
          <Tooltip
            formatter={(value, _, props) => {
              const p = props?.payload as { fullName: string; count: number }
              return [`${value}% (${p?.count ?? 0} resp.)`, p?.fullName ?? '']
            }}
          />
          <Bar dataKey="pct" fill={color} radius={[0, 4, 4, 0]} background={{ fill: emptyColor }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
