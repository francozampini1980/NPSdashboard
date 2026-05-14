'use client'

import { Plus, X } from 'lucide-react'
import type { ChoiceConfig, DefaultLogic, SingleChoiceLogic, BuilderQuestion, LogicTarget } from '@/types/survey'
import { buildLogicTargets } from './logic-targets'

interface Props {
  question: BuilderQuestion
  onChange: (q: BuilderQuestion) => void
  allQuestions: BuilderQuestion[]
  variant: 'single_choice' | 'multiple_choice'
}

export default function ChoiceEditor({ question, onChange, allQuestions, variant }: Props) {
  const config = question.config as ChoiceConfig
  const targets = buildLogicTargets(allQuestions, question.id)

  // ---- Single choice: per-option logic ----
  const scLogic: SingleChoiceLogic = variant === 'single_choice'
    ? (() => {
        const raw = question.logic as Partial<SingleChoiceLogic>
        // Migrate from old DefaultLogic format
        const base = ('options' in raw && raw.options) ? raw : { options: {}, default: raw.default ?? 'next' }
        // Ensure every option index has an entry
        const options: Record<string, LogicTarget> = { ...base.options }
        config.options.forEach((_, i) => { if (!(String(i) in options)) options[String(i)] = 'next' })
        return { options, default: base.default ?? 'next' }
      })()
    : { options: {}, default: 'next' }

  // ---- Multiple choice: single default logic ----
  const mcLogic = question.logic as DefaultLogic

  function setConfig(patch: Partial<ChoiceConfig>) {
    onChange({ ...question, config: { ...config, ...patch } })
  }

  function setOption(i: number, value: string) {
    const options = [...config.options]
    options[i] = value
    setConfig({ options })
  }

  function setOptionLogic(i: number, target: string) {
    const newOptions = { ...scLogic.options, [String(i)]: target as LogicTarget }
    onChange({ ...question, logic: { ...scLogic, options: newOptions } })
  }

  function addOption() {
    const newIdx = config.options.length
    setConfig({ options: [...config.options, `Opción ${newIdx + 1}`] })
    if (variant === 'single_choice') {
      onChange({
        ...question,
        config: { ...config, options: [...config.options, `Opción ${newIdx + 1}`] },
        logic: { ...scLogic, options: { ...scLogic.options, [String(newIdx)]: 'next' as LogicTarget } },
      })
    }
  }

  function removeOption(i: number) {
    if (config.options.length <= 1) return
    const newOptions = config.options.filter((_, idx) => idx !== i)
    if (variant === 'single_choice') {
      // Reindex logic options
      const newLogicOptions: Record<string, LogicTarget> = {}
      newOptions.forEach((_, newIdx) => {
        const oldIdx = newIdx >= i ? newIdx + 1 : newIdx
        newLogicOptions[String(newIdx)] = scLogic.options[String(oldIdx)] ?? 'next'
      })
      onChange({ ...question, config: { ...config, options: newOptions }, logic: { ...scLogic, options: newLogicOptions } })
    } else {
      setConfig({ options: newOptions })
    }
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
      <div className="border-t border-slate-100 pt-4 space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Lógica de salto</p>

        {variant === 'single_choice' ? (
          /* Per-option logic */
          <>
            {config.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-3">
                <label className="text-xs text-slate-600 w-44 shrink-0 truncate">
                  Si elige «{opt || `Opción ${i + 1}`}»…
                </label>
                <select
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                  value={scLogic.options[String(i)] ?? 'next'}
                  onChange={e => setOptionLogic(i, e.target.value)}
                >
                  {targets.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            ))}
            {config.randomize && (
              <p className="text-xs text-amber-500">⚠ La lógica por opción se ignora cuando las opciones están aleatorizadas.</p>
            )}
          </>
        ) : (
          /* Single logic for multiple_choice */
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-600 shrink-0">Ir a…</label>
            <select
              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              value={mcLogic.default}
              onChange={e => onChange({ ...question, logic: { default: e.target.value } })}
            >
              {targets.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
