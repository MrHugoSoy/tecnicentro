'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resetSuccess = searchParams.get('reset') === 'success'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError('Credenciales inválidas.')
      setLoading(false)
      return
    }

    router.refresh()
    router.push('/admin')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 space-y-4">
      <h1 className="font-display text-2xl tracking-wider mb-6 text-brand-black">INICIAR SESIÓN</h1>

      <div>
        <label className="text-sm font-semibold block mb-1">Email</label>
        <input
          type="email"
          className="input-field"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div>
        <label className="text-sm font-semibold block mb-1">Contraseña</label>
        <input
          type="password"
          className="input-field"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>

      {resetSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">
          Contraseña actualizada. Inicia sesión con tu nueva contraseña.
        </div>
      )}

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
        {loading ? 'ENTRANDO...' : 'ENTRAR'}
      </button>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-3xl tracking-widest text-brand-yellow">TECNICENTRO</p>
          <p className="font-display text-sm text-gray-400 tracking-widest">PANEL ADMINISTRATIVO</p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
