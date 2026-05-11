'use client'

interface Props {
  promoters: number
  neutrals: number
  detractors: number
  total: number
}

const SEGMENTS = [
  { key: 'promoters' as const, label: 'Promotores', bg: 'bg-emerald-500', text: 'text-emerald-600' },
  { key: 'neutrals'  as const, label: 'Neutros',    bg: 'bg-amber-400',   text: 'text-amber-600'  },
  { key: 'detractors'as const, label: 'Detractores',bg: 'bg-red-500',     text: 'text-red-600'    },
]

export default function PromoterDonut({ promoters, neutrals, detractors, total }: Props) {
  const counts = { promoters, neutrals, detractors }
  const segments = SEGMENTS.map(s => ({
    ...s,
    count: counts[s.key],
    pct: total > 0 ? Math.round((counts[s.key] / total) * 100) : 0,
  }))

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-5">
      <h3 className="text-base font-semibold text-slate-700">Promotores · Neutros · Detractores</h3>

      {/* Barra apilada horizontal */}
      <div className="flex h-10 rounded-xl overflow-hidden gap-px bg-slate-100">
        {segments.map(({ label, count, pct, bg }) => pct > 0 && (
          <div
            key={label}
            className={`${bg} flex items-center justify-center transition-all`}
            style={{ width: `${pct}%` }}
            title={`${label}: ${count} resp. (${pct}%)`}
          >
            {pct >= 8 && (
              <span className="text-white text-xs font-bold drop-shadow-sm">{pct}%</span>
            )}
          </div>
        ))}
      </div>

      {/* Leyenda con valores */}
      <div className="flex items-start justify-around">
        {segments.map(({ label, count, pct, bg, text }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${bg}`} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
            <span className={`text-2xl font-bold ${text}`}>{pct}%</span>
            <span className="text-xs text-slate-400">{count.toLocaleString('es-AR')} resp.</span>
          </div>
        ))}
      </div>
    </div>
  )
}
