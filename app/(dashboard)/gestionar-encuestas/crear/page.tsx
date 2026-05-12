'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { BuilderState } from '@/types/survey'
import { defaultBuilderState } from '@/types/survey'
import Step1Info from './_components/Step1Info'
import Step2Questions from './_components/Step2Questions'
import Step3Config from './_components/Step3Config'

const STEPS = ['Información', 'Preguntas', 'Configuración']

// Inner component that uses useSearchParams (must be wrapped in Suspense)
function CrearEncuestaInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editingId = searchParams.get('edit')

  const [step, setStep] = useState(0)
  const [state, setState] = useState<BuilderState>(defaultBuilderState())
  const [loading, setLoading] = useState(!!editingId)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load existing survey when editing
  useEffect(() => {
    if (!editingId) return
    fetch(`/api/surveys/${editingId}`)
      .then(r => r.json())
      .then(data => {
        setState({
          name: data.name ?? '',
          description: data.description ?? '',
          headerImageFile: null,
          headerImageUrl: data.header_image_url ?? null,
          footerText: data.footer_text ?? '',
          questions: (data.survey_questions ?? []).map((q: Record<string, unknown>) => ({
            id: q.id,
            type: q.type,
            question: q.question,
            required: q.required,
            config: q.config,
            logic: q.logic,
          })),
          slug: data.slug ?? '',
          status: data.status ?? 'paused',
          closeAt: data.close_at ? data.close_at.slice(0, 16) : '',
          thanksTitle: data.thanks_title ?? '',
          thanksBody: data.thanks_body ?? '',
          thanksDuration: data.thanks_duration_seconds ? String(data.thanks_duration_seconds) : '',
          redirectUrl: data.redirect_url ?? '',
        })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [editingId])

  function update(patch: Partial<BuilderState>) {
    setState(prev => ({ ...prev, ...patch }))
  }

  function canProceed() {
    if (step === 0) return state.name.trim().length > 0
    if (step === 1) return true
    if (step === 2) return state.slug.trim().length > 0
    return true
  }

  async function uploadImage(): Promise<string | null> {
    if (!state.headerImageFile) return state.headerImageUrl

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const ext = state.headerImageFile.name.split('.').pop()
    const path = `headers/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('survey-assets')
      .upload(path, state.headerImageFile, { upsert: true })

    if (error) return null

    const { data } = supabase.storage.from('survey-assets').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleSave() {
    setError(null)
    setSaving(true)

    try {
      // Upload image con timeout de 10s
      let imageUrl: string | null = state.headerImageUrl
      if (state.headerImageFile) {
        try {
          const uploaded = await Promise.race([
            uploadImage(),
            new Promise<null>((_, reject) =>
              setTimeout(() => reject(new Error('Tiempo de carga de imagen agotado')), 10_000)
            ),
          ])
          imageUrl = uploaded
        } catch {
          // Continúa sin imagen si falla el upload
          imageUrl = null
        }
      }

      const payload = {
        name: state.name.trim(),
        description: state.description.trim() || null,
        header_image_url: imageUrl,
        footer_text: state.footerText,
        status: state.status,
        slug: state.slug.trim(),
        close_at: state.closeAt ? new Date(state.closeAt).toISOString() : null,
        thanks_title: state.thanksTitle,
        thanks_body: state.thanksBody,
        thanks_duration_seconds: state.thanksDuration ? Number(state.thanksDuration) : null,
        redirect_url: state.redirectUrl.trim() || null,
        questions: state.questions,
      }

      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 20_000)

      let res: Response
      try {
        res = await fetch(
          editingId ? `/api/surveys/${editingId}` : '/api/surveys',
          {
            method: editingId ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            signal: controller.signal,
          }
        )
      } finally {
        clearTimeout(timer)
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `Error HTTP ${res.status}` }))
        throw new Error(err.error ?? 'Error al guardar')
      }

      // Redirect al listado
      setSaving(false)
      router.push('/gestionar-encuestas/encuestas')
    } catch (e) {
      const msg = (e as Error).name === 'AbortError'
        ? 'La solicitud tardó demasiado. Intentá de nuevo.'
        : (e as Error).message
      setError(msg)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60 text-slate-400 text-sm">
        Cargando encuesta…
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          {editingId ? 'Editar encuesta' : 'Crear encuesta'}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          {editingId
            ? 'Modificá los datos y guardá los cambios.'
            : 'Completá los 3 pasos para publicar tu encuesta.'}
        </p>
      </div>

      {/* Step tabs */}
      <div className="flex gap-0 mb-6 bg-slate-100 p-1 rounded-xl">
        {STEPS.map((label, i) => (
          <button
            key={i}
            type="button"
            onClick={() => i < step + 1 && setStep(i)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              step === i
                ? 'bg-white shadow text-slate-800'
                : i < step
                  ? 'text-slate-500 hover:text-slate-700'
                  : 'text-slate-400 cursor-not-allowed'
            }`}
          >
            <span className={`mr-1.5 text-xs ${step > i ? 'text-emerald-500' : 'text-slate-400'}`}>
              {step > i ? '✓' : `${i + 1}.`}
            </span>
            {label}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6">
        <div
          className="bg-[#7A288A] h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Step content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        {step === 0 && <Step1Info state={state} onChange={update} />}
        {step === 1 && <Step2Questions state={state} onChange={update} />}
        {step === 2 && <Step3Config state={state} onChange={update} editingId={editingId} />}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={() => step === 0 ? router.push('/gestionar-encuestas/encuestas') : setStep(s => s - 1)}
          className="px-5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
        >
          {step === 0 ? 'Cancelar' : 'Atrás'}
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className="px-6 py-2.5 bg-[#7A288A] hover:bg-[#5e1e6b] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            disabled={!canProceed() || saving}
            className="px-6 py-2.5 bg-[#7A288A] hover:bg-[#5e1e6b] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Publicar encuesta'}
          </button>
        )}
      </div>
    </div>
  )
}

export default function CrearEncuestaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-60 text-slate-400 text-sm">
          Cargando…
        </div>
      }
    >
      <CrearEncuestaInner />
    </Suspense>
  )
}
