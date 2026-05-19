'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import type { BuilderState, BuilderQuestion, QuestionType } from '@/types/survey'
import { defaultConfig, defaultLogic } from '@/types/survey'
import QuestionCard from './QuestionCard'

interface Props {
  state: BuilderState
  onChange: (patch: Partial<BuilderState>) => void
}

const QUESTION_TYPES: { type: QuestionType; label: string; desc: string }[] = [
  { type: 'nps',             label: 'NPS',             desc: 'Escala 0–10 con lógica por segmento' },
  { type: 'reaction',        label: 'Reacción',        desc: 'Escala 1–5 (números, caritas o estrellas)' },
  { type: 'short_text',      label: 'Texto corto',     desc: 'Input de hasta 80 caracteres' },
  { type: 'long_text',       label: 'Texto largo',     desc: 'Textarea de hasta 500 caracteres' },
  { type: 'single_choice',   label: 'Opción única',    desc: 'Radio buttons' },
  { type: 'multiple_choice', label: 'Varias opciones', desc: 'Checkboxes con máximo configurable' },
  { type: 'announcement',    label: 'Comunicado',      desc: 'Texto informativo sin respuesta' },
  { type: 'divisor',         label: 'Divisor',         desc: 'Separa la encuesta en páginas distintas' },
]

export default function Step2Questions({ state, onChange }: Props) {
  const [showPicker, setShowPicker] = useState(false)

  function addQuestion(type: QuestionType) {
    const defaultQuestionText: Partial<Record<QuestionType, string>> = {
      nps: '¿Cómo valorarías tu experiencia?',
      reaction: '¿Cómo valorarías tu experiencia?',
    }
    const newQ: BuilderQuestion = {
      id: uuidv4(),
      type,
      question: defaultQuestionText[type] ?? '',
      required: type !== 'announcement' && type !== 'divisor',
      config: defaultConfig(type),
      logic: defaultLogic(type),
    }
    onChange({ questions: [...state.questions, newQ] })
    setShowPicker(false)
  }

  function updateQuestion(index: number, q: BuilderQuestion) {
    const questions = [...state.questions]
    questions[index] = q
    onChange({ questions })
  }

  function deleteQuestion(index: number) {
    onChange({ questions: state.questions.filter((_, i) => i !== index) })
  }

  function moveUp(index: number) {
    if (index === 0) return
    const questions = [...state.questions]
    ;[questions[index - 1], questions[index]] = [questions[index], questions[index - 1]]
    onChange({ questions })
  }

  function moveDown(index: number) {
    if (index === state.questions.length - 1) return
    const questions = [...state.questions]
    ;[questions[index], questions[index + 1]] = [questions[index + 1], questions[index]]
    onChange({ questions })
  }

  return (
    <div className="space-y-4">
      {state.questions.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm">
          Todavía no agregaste preguntas. Usá el botón de abajo para agregar.
        </div>
      )}

      {(() => {
        let nonDivCount = 0
        return state.questions.map((q, i) => {
          if (q.type !== 'divisor') nonDivCount++
          return (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              questionNumber={nonDivCount}
              total={state.questions.length}
              allQuestions={state.questions}
              onChange={(updated) => updateQuestion(i, updated)}
              onMoveUp={() => moveUp(i)}
              onMoveDown={() => moveDown(i)}
              onDelete={() => deleteQuestion(i)}
            />
          )
        })
      })()}

      {/* Add question */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-purple-200 rounded-xl text-sm text-[#7A288A] hover:border-[#7A288A] hover:bg-purple-50 transition-colors w-full justify-center font-medium"
        >
          <Plus size={16} />
          Agregar componente
        </button>

        {showPicker && (
          <div className="absolute top-full left-0 mt-2 z-10 w-full bg-white rounded-xl shadow-lg border border-slate-100 py-2">
            {QUESTION_TYPES.map(({ type, label, desc }) => (
              <button
                key={type}
                type="button"
                onClick={() => addQuestion(type)}
                className="flex items-start gap-3 w-full px-4 py-3 hover:bg-slate-50 text-left transition-colors"
              >
                <span className="text-xs font-semibold text-[#7A288A] bg-purple-50 px-2 py-0.5 rounded-full shrink-0 mt-0.5">
                  {label}
                </span>
                <span className="text-xs text-slate-500">{desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Thanks page config */}
      <div className="space-y-3 border-t border-slate-100 pt-5 mt-2">
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
