'use client'

import type { ReactionConfig, ReactionLogic, BuilderQuestion } from '@/types/survey'
import { buildLogicTargets } from './logic-targets'

interface Props {
  question: BuilderQuestion
  onChange: (q: BuilderQuestion) => void
  allQuestions: BuilderQuestion[]
}

const DISPLAYS = [
  { value: 'numbers', label: 'Números (1–5)' },
  { value: 'faces',   label: 'Caritas 😠→😊' },
  { value: 'stars',   label: 'Estrellas ★' },
]

export default function ReactionEditor({ question, onChange, allQuestions }: Props) {
  const config = question.config as ReactionConfig
  const logic = question.logic as ReactionLogic
  const targets = buildLogicTargets(allQuestions, question.id)

  function setConfig(patch: Partial<ReactionConfig>) {
    onChange({ ...question, config: { ...config, ...patch } })
  }

  function setLogic(patch: Partial<ReactionLogic>) {
    onChange({ ...question, logic: { ...logic, ...patch } })
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Pregunta</label>
        <input
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          value={question.question}
          onChange={e => onChange({ ...question, question: e.target.value })}
          placeholder="¿Cómo valorarías tu experiencia?"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Etiqueta baja</label>
          <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            value={config.label_low}
            onChange={e => setConfig({ label_low: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Etiqueta alta</label>
          <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            value={config.label_high}
            onChange={e => setConfig({ label_high: e.target.value })}
          />
        </div>
      </div>
      <p className="text-xs text-slate-400">La escala de reacción es siempre de 1 a 5.</p>

      {/* Display type */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-2">Visualización</label>
        <div className="flex gap-2">
          {DISPLAYS.map(d => (
            <button
              key={d.value}
              type="button"
              onClick={() => setConfig({ display: d.value as ReactionConfig['display'] })}
              className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                config.display === d.value
                  ? 'border-[#7A288A] bg-purple-50 text-[#7A288A]'
                  : 'border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

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
        {[
          { key: 'negative',  label: 'Si son negativas (1–2) ir a…' },
          { key: 'neutral',   label: 'Si son neutras (3) ir a…' },
          { key: 'positive',  label: 'Si son positivas (4–5) ir a…' },
        ].map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3">
            <label className="text-xs text-slate-600 w-52 shrink-0">{label}</label>
            <select
              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              value={logic[key as keyof ReactionLogic]}
              onChange={e => setLogic({ [key]: e.target.value } as Partial<ReactionLogic>)}
            >
              {targets.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
