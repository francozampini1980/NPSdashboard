'use client'

import type { AnnouncementConfig, DefaultLogic, BuilderQuestion } from '@/types/survey'
import { buildLogicTargets } from './logic-targets'

interface Props {
  question: BuilderQuestion
  onChange: (q: BuilderQuestion) => void
  allQuestions: BuilderQuestion[]
}

export default function AnnouncementEditor({ question, onChange, allQuestions }: Props) {
  const config = question.config as AnnouncementConfig
  const logic = question.logic as DefaultLogic
  const targets = buildLogicTargets(allQuestions, question.id)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Contenido del comunicado</label>
        <textarea
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
          rows={5}
          value={config.content}
          onChange={e => onChange({ ...question, config: { content: e.target.value } })}
          placeholder="Escribí el texto que verá el usuario…"
        />
      </div>
      <p className="text-xs text-slate-400">Este componente no tiene respuesta, solo muestra contenido y avanza.</p>

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
