'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Props {
  promoters: number
  neutrals: number
  detractors: number
  total: number
}

const COLORS = {
  Promotores: '#10B981',
  Neutros: '#F59E0B',
  Detractores: '#EF4444',
}

export default function PromoterDonut({ promoters, neutrals, detractors, total }: Props) {
  const data = [
    { name: 'Promotores', value: promoters, pct: total > 0 ? Math.round((promoters / total) * 100) : 0 },
    { name: 'Neutros', value: neutrals, pct: total > 0 ? Math.round((neutrals / total) * 100) : 0 },
    { name: 'Detractores', value: detractors, pct: total > 0 ? Math.round((detractors / total) * 100) : 0 },
  ]

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, pct }: {
    cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; pct: number
  }) => {
    if (pct < 5) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${pct}%`}
      </text>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Promotores · Neutros · Detractores</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel as never}
          >
            {data.map(entry => (
              <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => {
              const item = data.find(d => d.name === name)
              return [`${value} (${item?.pct ?? 0}%)`, String(name)]
            }}
          />
          <Legend
            formatter={(value, entry) => {
              const item = data.find(d => d.name === value)
              return <span className="text-xs text-slate-600">{value}: {item?.pct ?? 0}%</span>
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
