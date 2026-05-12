'use client'

import { Plus, X } from 'lucide-react'
import type { ChoiceConfig, DefaultLogic, BuilderQuestion } from '@/types/survey'

interface Props {
  question: BuilderQuestion
  onChange: (q: BuilderQuestion) => void
  allQuestions: BuilderQuestion[]
  variant: 'single_choice' | 'multiple_choice'
}

const LOGIC_TARGETS = (qs: BuilderQuestion[], currentId: string) => [
  { value: 'next', label: 'Siguiente pregunta' },
  { value: 'end',  label: 'Fin de encuesta' },
  ...qs.filter(q => q.id !== currentId).map(q => ({
    value: q.id,
    label: q.question || 'Pregunta sin título',
  })),
]

export default function ChoiceEditor({ question, onChange, allQuestions, variant }: Props) {
  const config = question.config as ChoiceConfig
  const logic = question.logic as DefaultLogic
  const targets = LOGIC_TARGETS(allQuestions, question.id)

  function setConfig(patch: Partial<ChoiceConfig>) {
    onChange({ ...question, config: { ...config, ...patch } })
  }

  function setOption(i: number, value: string) {
    const options = [...config.options]
    options[i] = value
    setConfig({ options })
  }

  function addOption() {
    setConfig({ options: [...config.options, `Opción ${config.options.length + 1}`] })
  }

  function removeOption(i: number) {
    if (config.options.length <= 1) return
    const options = config.options.filter((_, idx) => idx !== i)
    setConfig({ options })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Pregunta</label>
        <input
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          value={question.question}
          onChange={e => onChange({ ...question, question: e.target.value })}
          placeholder="Escribí tu pregunta…"
        />
      </div>

      {/* Options */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-2">Opciones</label>
        <div className="space-y-2">
          {config.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-slate-300 text-xs w-4 text-right shrink-0">{i + 1}.</span>
              <input
                className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                value={opt}
                onChange={e => setOption(i, e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeOption(i)}
                disabled={config.options.length <= 1}
                className="text-slate-300 hover:text-red-400 disabled:opacity-30 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addOption}
          className="mt-2 flex items-center gap-1.5 text-xs text-[#7A288A] hover:text-[#5e1e6b] font-medium transition-colors"
        >
          <Plus size={13} /> Agregar opción
        </button>
      </div>

      {/* Randomize */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={config.randomize}
          onChange={e => setConfig({ randomize: e.target.checked })}
          className="rounded border-slate-300 text-[#7A288A] focus:ring-purple-300"
        />
        <span className="text-sm text-slate-600">Aleatorizar opciones</span>
      </label>

      {/* Max selections (multiple only) */}
      {variant === 'multiple_choice' && (
        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-600 shrink-0">Máximo de selecciones</label>
          <input
            type="number"
            min={1}
            max={config.options.length}
            value={config.max_selections ?? ''}
            onChange={e => setConfig({ max_selections: e.target.value ? Number(e.target.value) : undefined })}
            placeholder="Sin límite"
            className="w-24 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      )}

      {/* Required toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <div
          onClick={() => onChange({ ...question, required: !question.required })}
          className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${question.required ? 'bg-[#7A288A]' : 'bg-slate-300'}`}
        >
          <span className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${question.required ? 'translate-x-4' : 'translate-x-0'}`} />
        </div>
        <span className="text-sm text-slate-600">Obligatorio</span>
      </label>

      {/* Logic */}
      <div className="border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Lógica de salto</p>
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-600 shrink-0">Ir a…</label>
          <select
            className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            value={logic.default}
            onChange={e => onChange({ ...question, logic: { default: e.target.value } })}
          >
            {targets.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  )
}
