'use client'

import { Suspense } from 'react'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { loginAction } from './actions'

function LoginForm() {
  const [error, formAction, pending] = useActionState(loginAction, null)
  const searchParams = useSearchParams()
  const resetSuccess = searchParams.get('reset') === 'success'

  return (
    <form action={formAction} className="bg-white p-8 space-y-4">
      <h1 className="font-display text-2xl tracking-wider mb-6 text-brand-black">INICIAR SESIÓN</h1>

      <div>
        <label className="text-sm font-semibold block mb-1">Email</label>
        <input
          type="email"
          name="email"
          className="input-field"
          required
          autoFocus
        />
      </div>

      <div>
        <label className="text-sm font-semibold block mb-1">Contraseña</label>
        <input
          type="password"
          name="password"
          className="input-field"
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
        disabled={pending}
        className="btn-primary w-full text-center disabled:opacity-50 mt-2"
      >
        {pending ? 'ENTRANDO...' : 'ENTRAR'}
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
