'use client'

import { Copy, CheckCheck, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import type { BuilderState } from '@/types/survey'

interface Props {
  state: BuilderState
  onChange: (patch: Partial<BuilderState>) => void
  editingId: string | null   // null = new survey
}

export default function Step3Config({ state, onChange, editingId }: Props) {
  const [copied, setCopied] = useState(false)
  const surveyUrl = state.slug ? `${window.location.origin}/e/${state.slug}` : ''

  function copyLink() {
    if (!surveyUrl) return
    navigator.clipboard.writeText(surveyUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Slug */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Slug (URL de la encuesta) <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2 items-center">
          <span className="text-sm text-slate-400 shrink-0">/e/</span>
          <input
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            value={state.slug}
            onChange={e => onChange({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
            placeholder="mi-encuesta-2026"
          />
        </div>
        {surveyUrl && (
          <div className="flex items-center gap-2 mt-2">
            <a
              href={surveyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-[#7A288A] truncate transition-colors flex items-center gap-1"
            >
              {surveyUrl} <ExternalLink size={11} />
            </a>
            <button
              type="button"
              onClick={copyLink}
              className="shrink-0 text-xs flex items-center gap-1 text-slate-400 hover:text-[#7A288A] transition-colors"
            >
              {copied ? <CheckCheck size={13} className="text-emerald-500" /> : <Copy size={13} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        )}
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Estado inicial</label>
        <div className="flex gap-3">
          {(['active', 'paused'] as const).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => onChange({ status: s })}
              className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                state.status === s
                  ? s === 'active'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-400 bg-slate-50 text-slate-600'
                  : 'border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
            >
              {s === 'active' ? '● Activa' : '⏸ Pausada'}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Pausada = no accesible para usuarios. Podés activarla después desde la lista.
        </p>
      </div>

      {/* Close at */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha y hora de cierre automático</label>
        <input
          type="datetime-local"
          className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          value={state.closeAt}
          onChange={e => onChange({ closeAt: e.target.value })}
        />
        <p className="text-xs text-slate-400 mt-1">Opcional. Al llegar esa fecha la encuesta se pausa automáticamente.</p>
      </div>

      {/* Thanks page */}
      <div className="space-y-3 border-t border-slate-100 pt-5">
        <p className="text-sm font-semibold text-slate-700">Página de gracias</p>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Título</label>
          <input
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            value={state.thanksTitle}
            onChange={e => onChange({ thanksTitle: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Contenido</label>
          <textarea
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
            rows={3}
            value={state.thanksBody}
            onChange={e => onChange({ thanksBody: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Duración (segundos)</label>
            <input
              type="number"
              min={1}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              value={state.thanksDuration}
              onChange={e => onChange({ thanksDuration: e.target.value })}
              placeholder="Sin límite"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Redirect URL</label>
            <input
              type="url"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              value={state.redirectUrl}
              onChange={e => onChange({ redirectUrl: e.target.value })}
              placeholder="https://…"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
