'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Trash2, RefreshCw, CheckCircle, AlertCircle, FileText, Upload } from 'lucide-react'
import { getAllMonths, upsertMonthData, deleteMonthData } from '@/lib/storage'
import { parseCSV } from '@/lib/csv-parser'
import { MonthlyNPSData, Aspect, formatMonthLabelFull } from '@/types'
import { AspectsInput, EMPTY_ASPECTS, UploadState } from './shared'

export default function PostCompraTab() {
  const [months, setMonths] = useState<MonthlyNPSData[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadState, setUploadState] = useState<UploadState>({ status: 'idle' })
  const [pendingData, setPendingData] = useState<MonthlyNPSData | null>(null)
  const [impressions, setImpressions] = useState('')
  const [overrideMonth, setOverrideMonth] = useState('')
  const [previewRows, setPreviewRows] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [positiveAspects, setPositiveAspects] = useState<Aspect[]>(EMPTY_ASPECTS)
  const [negativeAspects, setNegativeAspects] = useState<Aspect[]>(EMPTY_ASPECTS)
  const fileRef = useRef<HTMLInputElement>(null)

  const loadMonths = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllMonths()
      setMonths(data.filter(d => d.survey_type === 'post_purchase').sort((a, b) => b.month.localeCompare(a.month)))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadMonths() }, [loadMonths])

  const processFile = useCallback(async (file: File) => {
    setSelectedFile(file)
    setUploadState({ status: 'parsing' })
    setPendingData(null)
    try {
      const text = await file.text()
      const { data, detectedMonth, rowCount } = parseCSV(text, parseInt(impressions || '0', 10))
      setPendingData(data)
      setOverrideMonth(detectedMonth)
      setPreviewRows(rowCount)
      setUploadState({ status: 'success' })
    } catch (err) {
      setUploadState({ status: 'error', message: err instanceof Error ? err.message : 'Error al procesar el archivo.' })
    }
  }, [impressions])

  const reset = () => {
    setUploadState({ status: 'idle' })
    setPendingData(null)
    setSelectedFile(null)
    setPositiveAspects(EMPTY_ASPECTS)
    setNegativeAspects(EMPTY_ASPECTS)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleConfirmUpload = async () => {
    if (!pendingData) return
    try {
      const pos = positiveAspects.filter(a => a.title.trim())
      const neg = negativeAspects.filter(a => a.title.trim())
      await upsertMonthData({
        ...pendingData,
        month: overrideMonth,
        impressions: parseInt(impressions || '0', 10),
        positive_aspects: pos.length > 0 ? pos : undefined,
        negative_aspects: neg.length > 0 ? neg : undefined,
      })
      reset()
      setImpressions('')
      await loadMonths()
    } catch {
      setUploadState({ status: 'error', message: 'Error al guardar los datos.' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-700 mb-4">Cargar CSV mensual — Post Compra</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Total de impresiones del mes <span className="text-slate-400 font-normal">(para tasa de respuesta)</span>
          </label>
          <input
            type="number" min="0" value={impressions}
            onChange={e => setImpressions(e.target.value)}
            placeholder="Ej: 12000"
            className="w-full md:w-64 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>

        <div
          onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) processFile(f) }}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
          }`}
        >
          <Upload size={24} className="mx-auto mb-2 text-slate-400" />
          <p className="text-sm font-medium text-slate-600">
            {selectedFile ? selectedFile.name : 'Arrastrá tu CSV acá o hacé click para seleccionar'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Solo archivos .csv</p>
          <input ref={fileRef} type="file" accept=".csv" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }} />
        </div>

        {uploadState.status === 'parsing' && (
          <div className="mt-4 flex items-center gap-2 text-blue-600 text-sm">
            <RefreshCw size={14} className="animate-spin" /> Procesando...
          </div>
        )}
        {uploadState.status === 'error' && (
          <div className="mt-4 flex items-start gap-2 text-red-600 text-sm bg-red-50 rounded-lg p-3">
            <AlertCircle size={16} className="shrink-0 mt-0.5" /> {uploadState.message}
          </div>
        )}

        {uploadState.status === 'success' && pendingData && (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-5">
            <div className="flex items-center gap-2 text-emerald-700 font-medium text-sm">
              <CheckCircle size={16} /> Archivo procesado correctamente
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Respuestas', value: previewRows },
                { label: 'NPS calculado', value: `${pendingData.nps_score > 0 ? '+' : ''}${pendingData.nps_score}` },
                { label: 'Mes detectado', value: overrideMonth ? formatMonthLabelFull(overrideMonth) : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-lg p-3 border border-emerald-100">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="text-lg font-bold text-slate-800">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Mes al que corresponde <span className="text-slate-400">(podés corregirlo)</span>
              </label>
              <input
                type="month" value={overrideMonth}
                onChange={e => setOverrideMonth(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              {months.some(m => m.month === overrideMonth) && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> Ya existe un CSV para este mes. Se reemplazará.
                </p>
              )}
            </div>

            <div className="border-t border-emerald-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-8">
              <AspectsInput
                label="4 aspectos más mencionados — Positivos 🥰 (puntajes 7 a 10)"
                values={positiveAspects}
                onChange={setPositiveAspects}
                color="emerald"
              />
              <AspectsInput
                label="4 aspectos más mencionados — Negativos y neutros 🤬🤨 (puntajes 0 a 6)"
                values={negativeAspects}
                onChange={setNegativeAspects}
                color="red"
              />
            </div>

            <div className="flex gap-2">
              <button onClick={handleConfirmUpload} disabled={!overrideMonth}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition">
                Confirmar y guardar
              </button>
              <button onClick={reset}
                className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de meses */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-700 mb-4">
          Meses cargados <span className="text-slate-400 font-normal">({months.length})</span>
        </h3>
        {loading ? (
          <p className="text-slate-400 text-sm">Cargando...</p>
        ) : months.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <FileText size={32} className="mx-auto mb-2 opacity-40" />
            <p className="text-sm">Todavía no cargaste ningún mes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {months.map(m => (
              <div key={m.month} className="flex items-center justify-between px-4 py-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{formatMonthLabelFull(m.month)}</p>
                    <p className="text-xs text-slate-400">
                      {m.total_responses.toLocaleString('es')} respuestas · NPS {m.nps_score > 0 ? `+${m.nps_score}` : m.nps_score}
                      {m.positive_aspects?.length ? ' · aspectos cargados ✓' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!confirm(`¿Eliminar los datos de ${formatMonthLabelFull(m.month)}?`)) return
                    await deleteMonthData(m.month)
                    await loadMonths()
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
