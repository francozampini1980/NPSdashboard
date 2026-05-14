'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase-browser'
import { Loader2 } from 'lucide-react'

type Mode = 'login' | 'forgot'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = getBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = getBrowserClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    })
    setMessage('Si el email está registrado, recibirás un enlace para restablecer tu contraseña.')
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <Image
          src="/logo_fravega.svg"
          alt="Frávega"
          width={140}
          height={21}
          priority
          className="mx-auto mb-4"
        />
        <h1 className="text-xl font-bold text-slate-800">Métricas de Experiencia</h1>
        <p className="text-slate-500 text-sm mt-1">Dashboard NPS</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        {mode === 'login' ? (
          <>
            <h2 className="text-lg font-semibold text-slate-800 mb-6">Iniciar sesión</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
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
                {loading ? 'Ingresando…' : 'Ingresar'}
              </button>
            </form>

            <button
              onClick={() => { setMode('forgot'); setError('') }}
              className="mt-4 w-full text-center text-sm text-slate-500 hover:text-blue-600 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Recuperar contraseña</h2>
            <p className="text-sm text-slate-500 mb-6">
              Te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}
              {message && (
                <p className="text-emerald-700 text-sm bg-emerald-50 rounded-lg px-3 py-2">{message}</p>
              )}

              <button
                type="submit"
                disabled={loading || !!message}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Enviando…' : 'Enviar enlace'}
              </button>
            </form>

            <button
              onClick={() => { setMode('login'); setMessage(''); setError('') }}
              className="mt-4 w-full text-center text-sm text-slate-500 hover:text-blue-600 transition-colors"
            >
              ← Volver al login
            </button>
          </>
        )}
      </div>
    </div>
  )
}
