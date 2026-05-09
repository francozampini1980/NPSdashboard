'use client'

import { useState } from 'react'
import { MessageSquareText, X } from 'lucide-react'
import { Aspect } from '@/types'

interface Props {
  positiveAspects?: Aspect[]
  negativeAspects?: Aspect[]
  openComments?: string[]
  positiveLabel?: string
  negativeLabel?: string
}

export default function CommentHighlights({
  positiveAspects,
  negativeAspects,
  openComments,
  positiveLabel = 'Calificaciones positivas 🥰',
  negativeLabel = 'Calificaciones negativas y neutras 🤬',
}: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  const hasPositive = positiveAspects && positiveAspects.length > 0
  const hasNegative = negativeAspects && negativeAspects.length > 0

  if (!hasPositive && !hasNegative) return null

  const showTwoColumns = hasPositive && hasNegative

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">
            Motivos para detracción y promoción
          </h3>
          {openComments && openComments.length > 0 && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <MessageSquareText size={13} />
              Ver todos los comentarios ({openComments.length})
            </button>
          )}
        </div>

        <div className={`grid grid-cols-1 gap-4 ${showTwoColumns ? 'md:grid-cols-2' : ''}`}>
          {hasPositive && (
            <AspectList
              label={positiveLabel}
              aspects={positiveAspects}
              color="emerald"
            />
          )}
          {hasNegative && (
            <AspectList
              label={negativeLabel}
              aspects={negativeAspects}
              color="red"
            />
          )}
        </div>
      </div>

      {modalOpen && (
        <CommentsModal
          title="Todos los comentarios"
          comments={openComments ?? []}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}

// ─── Tarjeta independiente para aspectos CES (col C post entrega) ─────────────

interface AspectsCardProps {
  title: string
  aspects?: Aspect[]
  comments?: string[]
  commentsModalTitle?: string
  aspectListLabel?: string
}

export function AspectsCard({
  title,
  aspects,
  comments,
  commentsModalTitle,
  aspectListLabel = 'Principales motivos',
}: AspectsCardProps) {
  const [modalOpen, setModalOpen] = useState(false)

  if (!aspects || aspects.length === 0) return null

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
          {comments && comments.length > 0 && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <MessageSquareText size={13} />
              Ver todos los comentarios ({comments.length})
            </button>
          )}
        </div>

        <AspectList label={aspectListLabel} aspects={aspects} color="red" />
      </div>

      {modalOpen && (
        <CommentsModal
          title={commentsModalTitle ?? title}
          comments={comments ?? []}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}

// Alias para retrocompatibilidad
export function CESAspectsCard({ aspects, cesComments }: { aspects?: Aspect[]; cesComments?: string[] }) {
  return (
    <AspectsCard
      title="Aspectos negativos 🤬 seguimiento de pedido"
      aspects={aspects}
      comments={cesComments}
      commentsModalTitle="Comentarios de seguimiento de pedido"
      aspectListLabel="Principales motivos de calificación negativa"
    />
  )
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function AspectList({ label, aspects, color }: {
  label: string
  aspects: Aspect[]
  color: 'emerald' | 'red'
}) {
  const bgClass = color === 'emerald' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'
  const labelClass = color === 'emerald' ? 'text-emerald-700' : 'text-red-600'
  const numClass = color === 'emerald' ? 'text-emerald-500' : 'text-red-400'

  return (
    <div className={`rounded-lg border p-4 ${bgClass}`}>
      <p className={`text-xs font-semibold mb-3 ${labelClass}`}>{label}</p>
      <ol className="space-y-4">
        {aspects.map((aspect, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className={`font-bold text-sm shrink-0 w-4 mt-0.5 ${numClass}`}>{i + 1}.</span>
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-snug">{aspect.title}</p>
              <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{aspect.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function CommentsModal({ title, comments, onClose }: {
  title: string
  comments: string[]
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">
            {title}
            <span className="ml-2 text-slate-400 font-normal">({comments.length})</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <ol className="overflow-y-auto px-6 py-4 space-y-3 flex-1">
          {comments.map((comment, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-xs text-slate-400 tabular-nums shrink-0 w-6 pt-0.5">{i + 1}.</span>
              <p className="text-sm text-slate-700 leading-relaxed">{comment}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
