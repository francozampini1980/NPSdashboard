'use client'

import type { DefaultLogic, BuilderQuestion } from '@/types/survey'

interface Props {
  question: BuilderQuestion
  onChange: (q: BuilderQuestion) => void
  allQuestions: BuilderQuestion[]
  variant: 'short_text' | 'long_text'
}

const LOGIC_TARGETS = (qs: BuilderQuestion[], currentId: string) => [
  { value: 'next', label: 'Siguiente pregunta' },
  { value: 'end',  label: 'Fin de encuesta' },
  ...qs.filter(q => q.id !== currentId).map(q => ({
    value: q.id,
    label: q.question || 'Pregunta sin título',
  })),
]

export default function TextEditor({ question, onChange, allQuestions, variant }: Props) {
  const logic = question.logic as DefaultLogic
  const targets = LOGIC_TARGETS(allQuestions, question.id)
  const maxChars = variant === 'short_text' ? 80 : 500

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
      <p className="text-xs text-slate-400">
        El usuario verá {variant === 'short_text' ? 'un input de hasta 80 caracteres' : 'un textarea de hasta 500 caracteres'}.
      </p>

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
