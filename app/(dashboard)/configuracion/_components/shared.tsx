'use client'

import { Aspect } from '@/types'

export interface UploadState {
  status: 'idle' | 'parsing' | 'success' | 'error'
  message?: string
}

export const EMPTY_ASPECTS: Aspect[] = [
  { title: '', description: '' },
  { title: '', description: '' },
  { title: '', description: '' },
  { title: '', description: '' },
]

export function AspectsInput({
  label,
  values,
  onChange,
  color,
}: {
  label: string
  values: Aspect[]
  onChange: (vals: Aspect[]) => void
  color: 'emerald' | 'red'
}) {
  const titleBorder = color === 'emerald'
    ? 'focus:ring-emerald-400/30 focus:border-emerald-400'
    : 'focus:ring-red-400/30 focus:border-red-400'
  const numClass = color === 'emerald' ? 'text-emerald-600' : 'text-red-500'

  function update(i: number, field: 'title' | 'description', val: string) {
    const next = values.map((a, idx) => idx === i ? { ...a, [field]: val } : a)
    onChange(next)
  }

  return (
    <div>
      {label && <p className="text-xs font-semibold text-slate-600 mb-3">{label}</p>}
      <div className="space-y-4">
        {values.map((v, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={`text-xs font-bold w-4 shrink-0 mt-2 ${numClass}`}>{i + 1}.</span>
            <div className="flex-1 space-y-1.5">
              <input
                type="text"
                value={v.title}
                onChange={e => update(i, 'title', e.target.value)}
                placeholder="Título (ej: Incumplimiento de plazos)"
                className={`w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 ${titleBorder}`}
              />
              <textarea
                value={v.description}
                onChange={e => update(i, 'description', e.target.value)}
                placeholder="Descripción del aspecto…"
                rows={2}
                className={`w-full border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 resize-none focus:outline-none focus:ring-2 ${titleBorder}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
