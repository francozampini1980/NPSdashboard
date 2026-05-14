'use client'

import { ChevronUp, ChevronDown, Trash2, Scissors } from 'lucide-react'
import type { BuilderQuestion, DefaultLogic, QuestionType } from '@/types/survey'
import { buildDivisorTargets } from './question-editors/logic-targets'
import NPSEditor from './question-editors/NPSEditor'
import ReactionEditor from './question-editors/ReactionEditor'
import TextEditor from './question-editors/TextEditor'
import ChoiceEditor from './question-editors/ChoiceEditor'
import AnnouncementEditor from './question-editors/AnnouncementEditor'

const TYPE_LABELS: Record<QuestionType, string> = {
  nps: 'NPS',
  short_text: 'Texto corto',
  long_text: 'Texto largo',
  reaction: 'Reacción',
  single_choice: 'Opción única',
  multiple_choice: 'Varias opciones',
  announcement: 'Comunicado',
  divisor: 'Divisor',
}

interface Props {
  question: BuilderQuestion
  index: number
  questionNumber: number  // position among non-divisor questions (1-based)
  total: number
  allQuestions: BuilderQuestion[]
  onChange: (q: BuilderQuestion) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}

// Shared move/delete controls
function CardControls({ index, total, onMoveUp, onMoveDown, onDelete }: {
  index: number; total: number
  onMoveUp: () => void; onMoveDown: () => void; onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={onMoveUp} disabled={index === 0}
        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors">
        <ChevronUp size={15} />
      </button>
      <button type="button" onClick={onMoveDown} disabled={index === total - 1}
        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors">
        <ChevronDown size={15} />
      </button>
      <button type="button" onClick={onDelete}
        className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
        <Trash2 size={15} />
      </button>
    </div>
  )
}

export default function QuestionCard({
  question, index, questionNumber, total, allQuestions, onChange, onMoveUp, onMoveDown, onDelete
}: Props) {

  // ---- Divisor: compact card with logic editor ----
  if (question.type === 'divisor') {
    const divLogic = question.logic as DefaultLogic
    const targets = buildDivisorTargets(allQuestions, question.id)

    return (
      <div className="border border-purple-200 bg-purple-50/40 rounded-xl overflow-hidden">
        {/* Header strip */}
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="flex-1 border-t-2 border-dashed border-purple-300" />
          <div className="flex items-center gap-1.5 shrink-0">
            <Scissors size={13} className="text-purple-400" />
            <span className="text-xs font-semibold text-purple-500">Divisor de página</span>
          </div>
          <div className="flex-1 border-t-2 border-dashed border-purple-300" />
          <CardControls index={index} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} />
        </div>
        {/* Logic */}
        <div className="px-4 pb-3 border-t border-purple-100">
          <div className="flex items-center gap-3 mt-2">
            <label className="text-xs text-slate-500 shrink-0">Al completar esta página ir a…</label>
            <select
              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
              value={divLogic.default ?? 'next'}
              onChange={e => onChange({ ...question, logic: { default: e.target.value } })}
            >
              {targets.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
      </div>
    )
  }

  // ---- Standard question card ----
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 w-5">{questionNumber}.</span>
          <span className="text-xs font-semibold text-[#7A288A] bg-purple-50 px-2 py-0.5 rounded-full">
            {TYPE_LABELS[question.type]}
          </span>
        </div>
        <CardControls index={index} total={total} onMoveUp={onMoveUp} onMoveDown={onMoveDown} onDelete={onDelete} />
      </div>

      {/* Editor body */}
      <div className="p-4">
        {question.type === 'nps' && (
          <NPSEditor question={question} onChange={onChange} allQuestions={allQuestions} />
        )}
        {question.type === 'reaction' && (
          <ReactionEditor question={question} onChange={onChange} allQuestions={allQuestions} />
        )}
        {(question.type === 'short_text' || question.type === 'long_text') && (
          <TextEditor question={question} onChange={onChange} allQuestions={allQuestions} variant={question.type} />
        )}
        {(question.type === 'single_choice' || question.type === 'multiple_choice') && (
          <ChoiceEditor question={question} onChange={onChange} allQuestions={allQuestions} variant={question.type} />
        )}
        {question.type === 'announcement' && (
          <AnnouncementEditor question={question} onChange={onChange} allQuestions={allQuestions} />
        )}
      </div>
    </div>
  )
}
