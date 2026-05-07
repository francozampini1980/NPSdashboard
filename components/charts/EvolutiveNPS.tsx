'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts'
import { BaseNPSDataPoint, formatMonthLabel } from '@/types'

interface Props {
  data: BaseNPSDataPoint[]
}

export default function EvolutiveNPS({ data }: Props) {
  const chartData = data.map(d => ({
    month: formatMonthLabel(d.month),
    nps: d.nps_score,
  }))

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Evolución NPS</h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis domain={[-100, 100]} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(v) => [Number(v) > 0 ? `+${v}` : String(v), 'NPS']}
          />
          <ReferenceLine y={0} stroke="#CBD5E1" strokeDasharray="4 4" />
          <Line
            type="monotone"
            dataKey="nps"
            stroke="#871ee3"
            strokeWidth={2.5}
            dot={{ fill: '#871ee3', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
