'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { PostEntregaMonthlyData, formatMonthLabel } from '@/types'

interface Props {
  data: PostEntregaMonthlyData[]
  title: string
  dataKey: keyof PostEntregaMonthlyData
  color?: string
}

export default function EvolutiveMetric({ data, title, dataKey, color = '#8B5CF6' }: Props) {
  const chartData = data.map(d => ({
    month: formatMonthLabel(d.month),
    value: Number(d[dataKey]),
  }))

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => [Number(v).toFixed(1), 'Puntaje']} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2.5}
            dot={{ fill: color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
