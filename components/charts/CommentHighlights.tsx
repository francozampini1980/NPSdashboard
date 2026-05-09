'use client'

import { useState } from 'react'
import { MessageSquareText, X } from 'lucide-react'

interface Props {
  positiveAspects?: string[]
  negativeAspects?: string[]
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

  const hasAspects =
    (positiveAspects && positiveAspects.length > 0) ||
    (negativeAspects && negativeAspects.length > 0)

  if (!hasAspects) return null

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Positivos */}
          <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-semibold text-emerald-700 mb-3">{positiveLabel}</p>
            {positiveAspects && positiveAspects.length > 0 ? (
              <ol className="space-y-2">
                {positiveAspects.map((aspect, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold text-sm shrink-0 w-4">{i + 1}.</span>
                    <span className="text-sm text-slate-700 leading-snug">{aspect}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-slate-400">Sin aspectos cargados</p>
            )}
          </div>

          {/* Negativos */}
          <div className="rounded-lg border border-red-100 bg-red-50 p-4">
            <p className="text-xs font-semibold text-red-600 mb-3">{negativeLabel}</p>
            {negativeAspects && negativeAspects.length > 0 ? (
              <ol className="space-y-2">
                {negativeAspects.map((aspect, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-400 font-bold text-sm shrink-0 w-4">{i + 1}.</span>
                    <span className="text-sm text-slate-700 leading-snug">{aspect}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs text-slate-400">Sin aspectos cargados</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal comentarios */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-800">
                Comentarios abiertos
                <span className="ml-2 text-slate-400 font-normal">
                  ({openComments?.length ?? 0})
                </span>
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <ol className="overflow-y-auto px-6 py-4 space-y-3 flex-1">
              {openComments?.map((comment, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-xs text-slate-400 tabular-nums shrink-0 w-6 pt-0.5">
                    {i + 1}.
                  </span>
                  <p className="text-sm text-slate-700 leading-relaxed">{comment}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </>
  )
}
