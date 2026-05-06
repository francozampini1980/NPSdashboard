'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase-browser'
import { BarChart3, Loader2 } from 'lucide-react'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setLoading(true)
    const supabase = getBrowserClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError('No se pudo actualizar la contraseña. Intentá de nuevo.')
      setLoading(false)
    } else {
      router.push('/nps-post-compra')
      router.refresh()
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 mb-4">
          <BarChart3 size={24} className="text-white" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Métricas de Experiencia</h1>
        <p className="text-slate-500 text-sm mt-1">Dashboard NPS</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-2">Establecer contraseña</h2>
        <p className="text-sm text-slate-500 mb-6">Elegí una contraseña para tu cuenta.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nueva contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Repetí la contraseña"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Guardando…' : 'Guardar contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
