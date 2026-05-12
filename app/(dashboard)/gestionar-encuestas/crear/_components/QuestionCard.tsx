'use client'

import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import type { BuilderQuestion, QuestionType } from '@/types/survey'
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
}

interface Props {
  question: BuilderQuestion
  index: number
  total: number
  allQuestions: BuilderQuestion[]
  onChange: (q: BuilderQuestion) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}

export default function QuestionCard({
  question, index, total, allQuestions, onChange, onMoveUp, onMoveDown, onDelete
}: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 w-5">{index + 1}.</span>
          <span className="text-xs font-semibold text-[#7A288A] bg-purple-50 px-2 py-0.5 rounded-full">
            {TYPE_LABELS[question.type]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
          >
            <ChevronUp size={15} />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors"
          >
            <ChevronDown size={15} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
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
