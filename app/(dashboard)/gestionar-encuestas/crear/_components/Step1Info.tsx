'use client'

import { useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'
import type { BuilderState } from '@/types/survey'

interface Props {
  state: BuilderState
  onChange: (patch: Partial<BuilderState>) => void
}

export default function Step1Info({ state, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    onChange({
      headerImageFile: file,
      headerImageUrl: URL.createObjectURL(file),
    })
  }

  function clearImage() {
    onChange({ headerImageFile: null, headerImageUrl: null })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Nombre de la encuesta <span className="text-red-400">*</span>
        </label>
        <input
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          value={state.name}
          onChange={e => onChange({ name: e.target.value })}
          placeholder="Ej: NPS Post Compra Q2 2026"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción</label>
        <textarea
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
          rows={3}
          value={state.description}
          onChange={e => onChange({ description: e.target.value })}
          placeholder="Descripción interna de la encuesta (no se muestra al usuario)"
        />
      </div>

      {/* Header image */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Header (logo)
        </label>
        {state.headerImageUrl ? (
          <div className="relative inline-block">
            <img
              src={state.headerImageUrl}
              alt="Header preview"
              className="h-12 w-auto max-w-[200px] object-contain rounded border border-slate-200"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X size={10} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-sm text-slate-400 hover:border-purple-300 hover:text-[#7A288A] transition-colors"
          >
            <ImagePlus size={16} />
            Subir imagen (máx. 200px de ancho)
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
        <p className="text-xs text-slate-400 mt-1">Solo visible en la encuesta pública como branding.</p>
      </div>

      {/* Footer */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Footer legal</label>
        <textarea
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
          rows={2}
          value={state.footerText}
          onChange={e => onChange({ footerText: e.target.value })}
        />
      </div>
    </div>
  )
}
