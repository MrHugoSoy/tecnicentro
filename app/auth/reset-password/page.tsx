'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Espera a que Supabase establezca la sesión desde las cookies del callback
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true)
      } else {
        // Escucha el evento PASSWORD_RECOVERY para el flujo implícito (hash)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
            setReady(true)
          }
        })
        return () => subscription.unsubscribe()
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.updateUser({ password })

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      await supabase.auth.signOut()
      router.push('/admin/login?reset=success')
    }
  }

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-3xl tracking-widest text-brand-yellow">TECNICENTRO</p>
          <p className="font-display text-sm text-gray-400 tracking-widest">PANEL ADMINISTRATIVO</p>
        </div>

        <div className="bg-white p-8">
          <h1 className="font-display text-2xl tracking-wider mb-6 text-brand-black">NUEVA CONTRASEÑA</h1>

          {!ready ? (
            <p className="text-sm text-gray-500 text-center py-4">Verificando sesión...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold block mb-1">Nueva contraseña</label>
                <input
                  type="password"
                  className="input-field"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoFocus
                  minLength={6}
                />
              </div>

              <div>
                <label className="text-sm font-semibold block mb-1">Confirmar contraseña</label>
                <input
                  type="password"
                  className="input-field"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-center disabled:opacity-50 mt-2"
              >
                {loading ? 'GUARDANDO...' : 'GUARDAR CONTRASEÑA'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
