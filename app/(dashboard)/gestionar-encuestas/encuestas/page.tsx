'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  PlusCircle,
  MoreVertical,
  Eye,
  Download,
  Pencil,
  Trash2,
  Play,
  Pause,
} from 'lucide-react'
import type { SurveyListItem } from '@/types/survey'

function StatusBadge({ status }: { status: 'active' | 'paused' }) {
  return status === 'active' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Activa
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Pausada
    </span>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function EncuestasPage() {
  const router = useRouter()
  const [surveys, setSurveys] = useState<SurveyListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/surveys')
    if (res.ok) setSurveys(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setOpenMenu(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  async function toggleStatus(survey: SurveyListItem) {
    const newStatus = survey.status === 'active' ? 'paused' : 'active'
    await fetch(`/api/surveys/${survey.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    await load()
  }

  async function deleteSurvey(id: string) {
    if (!confirm('¿Eliminás esta encuesta? Se borrarán todas las respuestas.')) return
    setDeleting(id)
    await fetch(`/api/surveys/${id}`, { method: 'DELETE' })
    setDeleting(null)
    await load()
  }

  function downloadCsv(id: string) {
    window.open(`/api/surveys/${id}/csv`, '_blank')
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Encuestas</h2>
          <p className="text-slate-500 text-sm mt-1">Gestioná tus encuestas activas y pausadas</p>
        </div>
        <Link
          href="/gestionar-encuestas/crear"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#7A288A] hover:bg-[#5e1e6b] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
        >
          <PlusCircle size={16} />
          Nueva encuesta
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Cargando encuestas…
        </div>
      ) : surveys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <p className="text-slate-400 text-sm">Todavía no creaste ninguna encuesta.</p>
          <Link
            href="/gestionar-encuestas/crear"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#7A288A] hover:bg-[#5e1e6b] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <PlusCircle size={16} />
            Crear primera encuesta
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 [&>th:first-child]:rounded-tl-xl [&>th:last-child]:rounded-tr-xl">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Nombre</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Estado</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Respuestas</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Creada</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Cierre</th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-5 py-3">Creador</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {surveys.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">{s.name}</p>
                    {s.description && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{s.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-5 py-4 text-slate-600 tabular-nums">
                    {s.response_count.toLocaleString('es-AR')}
                  </td>
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                    {formatDate(s.created_at)}
                  </td>
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                    {s.close_at ? formatDate(s.close_at) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-xs">
                    {s.creator_email ?? <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-4">
                    {/* 3-dot menu */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setOpenMenu(openMenu === s.id ? null : s.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {openMenu === s.id && (
                        <div className="absolute right-0 top-8 z-10 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1 text-sm">
                          <button
                            onClick={() => { router.push(`/gestionar-encuestas/encuestas/${s.id}/respuestas`); setOpenMenu(null) }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-slate-50 text-slate-700 transition-colors"
                          >
                            <Eye size={15} className="text-slate-400" />
                            Ver respuestas
                          </button>
                          <button
                            onClick={() => { downloadCsv(s.id); setOpenMenu(null) }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-slate-50 text-slate-700 transition-colors"
                          >
                            <Download size={15} className="text-slate-400" />
                            Descargar CSV
                          </button>
                          <button
                            onClick={() => { router.push(`/gestionar-encuestas/crear?edit=${s.id}`); setOpenMenu(null) }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-slate-50 text-slate-700 transition-colors"
                          >
                            <Pencil size={15} className="text-slate-400" />
                            Editar
                          </button>
                          <button
                            onClick={() => { toggleStatus(s); setOpenMenu(null) }}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-slate-50 text-slate-700 transition-colors"
                          >
                            {s.status === 'active'
                              ? <><Pause size={15} className="text-slate-400" /> Pausar</>
                              : <><Play size={15} className="text-slate-400" /> Activar</>}
                          </button>
                          <div className="my-1 border-t border-slate-100" />
                          <button
                            onClick={() => { deleteSurvey(s.id); setOpenMenu(null) }}
                            disabled={deleting === s.id}
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                            Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
