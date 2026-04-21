'use client'

import { useActionState } from 'react'
import { loginAction } from './actions'

export default function AdminLoginPage() {
  const [error, formAction, pending] = useActionState(loginAction, null)

  return (
    <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-3xl tracking-widest text-brand-yellow">TECNICENTRO</p>
          <p className="font-display text-sm text-gray-400 tracking-widest">PANEL ADMINISTRATIVO</p>
        </div>

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
      </div>
    </div>
  )
}
