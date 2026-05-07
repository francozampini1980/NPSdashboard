'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { UserPlus, Trash2, Loader2, RefreshCw, KeyRound } from 'lucide-react'

interface UserRow {
  id: string
  email: string
  role: 'visitor' | 'editor' | 'dios'
  created_at: string
  last_sign_in_at: string | null
}

const ROLE_LABELS: Record<string, string> = {
  visitor: 'Visitante',
  editor: 'Editor',
  dios: 'Dios',
}

const ROLE_COLORS: Record<string, string> = {
  visitor: 'bg-slate-100 text-slate-600',
  editor: 'bg-blue-100 text-blue-700',
  dios: 'bg-amber-100 text-amber-700',
}

export default function GestionUsuariosPage() {
  const { role, loading: authLoading } = useAuth()
  const router = useRouter()

  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'visitor' | 'editor' | 'dios'>('visitor')
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')
  const [inviteError, setInviteError] = useState('')

  // Create user form
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createConfirm, setCreateConfirm] = useState('')
  const [createRole, setCreateRole] = useState<'visitor' | 'editor' | 'dios'>('visitor')
  const [creating, setCreating] = useState(false)
  const [createMsg, setCreateMsg] = useState('')
  const [createError, setCreateError] = useState('')

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Role change
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && role !== 'dios') {
      router.push('/nps-post-compra')
    }
  }, [role, authLoading, router])

  useEffect(() => {
    if (role === 'dios') fetchUsers()
  }, [role])

  async function fetchUsers() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUsers(data.users)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteError('')
    setInviteMsg('')
    setInviting(true)
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setInviteMsg(`Invitación enviada a ${inviteEmail}`)
      setInviteEmail('')
      fetchUsers()
    } catch (e: unknown) {
      setInviteError(e instanceof Error ? e.message : 'Error al invitar')
    } finally {
      setInviting(false)
    }
  }

  async function handleDelete(userId: string) {
    setDeletingId(userId)
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUsers(prev => prev.filter(u => u.id !== userId))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al eliminar usuario')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setCreateError('')
    setCreateMsg('')
    if (createPassword !== createConfirm) {
      setCreateError('Las contraseñas no coinciden.')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: createEmail, password: createPassword, role: createRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCreateMsg(`Usuario ${createEmail} creado correctamente.`)
      setCreateEmail('')
      setCreatePassword('')
      setCreateConfirm('')
      setCreateRole('visitor')
      fetchUsers()
    } catch (e: unknown) {
      setCreateError(e instanceof Error ? e.message : 'Error al crear usuario')
    } finally {
      setCreating(false)
    }
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setUpdatingId(userId)
    try {
      const res = await fetch('/api/admin/update-role', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUsers(prev =>
        prev.map(u => u.id === userId ? { ...u, role: newRole as UserRow['role'] } : u)
      )
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al actualizar rol')
    } finally {
      setUpdatingId(null)
    }
  }

  if (authLoading || role !== 'dios') return null

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Gestión de usuarios</h1>
        <p className="text-slate-500 text-sm mt-1">Invitá usuarios y gestioná sus roles de acceso.</p>
      </div>

      {/* Create user form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <KeyRound size={16} />
          Crear usuario con contraseña
        </h2>
        <form onSubmit={handleCreateUser} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
              <input
                type="email"
                value={createEmail}
                onChange={e => setCreateEmail(e.target.value)}
                required
                placeholder="usuario@email.com"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Contraseña</label>
              <input
                type="password"
                value={createPassword}
                onChange={e => setCreatePassword(e.target.value)}
                required
                placeholder="Mín. 6 caracteres"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Confirmar contraseña</label>
              <input
                type="password"
                value={createConfirm}
                onChange={e => setCreateConfirm(e.target.value)}
                required
                placeholder="Repetir contraseña"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Rol</label>
              <select
                value={createRole}
                onChange={e => setCreateRole(e.target.value as UserRow['role'])}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="visitor">Visitante</option>
                <option value="editor">Editor</option>
                <option value="dios">Dios</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {creating && <Loader2 size={14} className="animate-spin" />}
              {creating ? 'Creando…' : 'Crear usuario'}
            </button>
          </div>
        </form>
        {createMsg && <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{createMsg}</p>}
        {createError && <p className="mt-3 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{createError}</p>}
      </div>

      {/* Invite form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <UserPlus size={16} />
          Invitar usuario por email
        </h2>
        <form onSubmit={handleInvite} className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-52">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              required
              placeholder="usuario@email.com"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Rol</label>
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value as UserRow['role'])}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="visitor">Visitante</option>
              <option value="editor">Editor</option>
              <option value="dios">Dios</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={inviting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {inviting && <Loader2 size={14} className="animate-spin" />}
            {inviting ? 'Enviando…' : 'Invitar'}
          </button>
        </form>
        {inviteMsg && <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{inviteMsg}</p>}
        {inviteError && <p className="mt-3 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{inviteError}</p>}
      </div>

      {/* Users table */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">
            Usuarios ({users.length})
          </h2>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-xs transition-colors"
          >
            <RefreshCw size={13} />
            Actualizar
          </button>
        </div>

        {error && (
          <p className="mx-6 mt-4 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-slate-400" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-100">
                <th className="text-left px-6 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Rol</th>
                <th className="text-left px-4 py-3 font-medium">Último acceso</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-6 py-3.5 text-slate-700 font-medium">{user.email}</td>
                  <td className="px-4 py-3.5">
                    {updatingId === user.id ? (
                      <Loader2 size={14} className="animate-spin text-slate-400" />
                    ) : (
                      <select
                        value={user.role}
                        onChange={e => handleRoleChange(user.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${ROLE_COLORS[user.role]}`}
                      >
                        <option value="visitor">Visitante</option>
                        <option value="editor">Editor</option>
                        <option value="dios">Dios</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 text-xs">
                    {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleDateString('es-AR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                        })
                      : 'Nunca'}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {deletingId === user.id ? (
                      <Loader2 size={14} className="animate-spin text-slate-400" />
                    ) : (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar a ${user.email}? Esta acción es irreversible.`)) {
                            handleDelete(user.id)
                          }
                        }}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
