'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'
import { MonthlyNPSData, formatMonthLabel } from '@/types'

interface Props {
  data: MonthlyNPSData[]
}

export default function EvolutivePromoters({ data }: Props) {
  const chartData = data.map(d => {
    const total = d.total_responses || 1
    return {
      month: formatMonthLabel(d.month),
      Promotores: Math.round((d.promoters_count / total) * 100),
      Neutros: Math.round((d.neutrals_count / total) * 100),
      Detractores: Math.round((d.detractors_count / total) * 100),
    }
  })

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Evolución Promotores · Neutros · Detractores</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} domain={[0, 100]} />
          <Tooltip formatter={(v) => `${v}%`} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line
            type="monotone"
            dataKey="Promotores"
            stroke="#10B981"
            strokeWidth={2.5}
            dot={{ fill: '#10B981', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Neutros"
            stroke="#F59E0B"
            strokeWidth={2.5}
            dot={{ fill: '#F59E0B', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Detractores"
            stroke="#EF4444"
            strokeWidth={2.5}
            dot={{ fill: '#EF4444', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
