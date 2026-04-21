'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { Cita, EstadoCita } from '@/types'

const estadoConfig: Record<EstadoCita, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  confirmada: { label: 'Confirmada', color: 'bg-blue-100 text-blue-700' },
  completada: { label: 'Completada', color: 'bg-green-100 text-green-700' },
  cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
}

const estadosSiguientes: Record<EstadoCita, EstadoCita[]> = {
  pendiente: ['confirmada', 'cancelada'],
  confirmada: ['completada', 'cancelada'],
  completada: [],
  cancelada: [],
}

const filtros: { value: string; label: string }[] = [
  { value: '', label: 'Todas' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'confirmada', label: 'Confirmadas' },
  { value: 'completada', label: 'Completadas' },
  { value: 'cancelada', label: 'Canceladas' },
]

export default function CitasTable({ citas: citasIniciales }: { citas: any[] }) {
  const router = useRouter()
  const [citas, setCitas] = useState(citasIniciales)
  const [filtro, setFiltro] = useState('')
  const [loading, setLoading] = useState<number | null>(null)

  const actualizarEstado = async (id: number, estado: EstadoCita) => {
    setLoading(id)
    const { error } = await supabase
      .from('citas')
      .update({ estado, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (!error) {
      setCitas(prev => prev.map(c => c.id === id ? { ...c, estado } : c))
    }
    setLoading(null)
  }

  const citasFiltradas = filtro ? citas.filter(c => c.estado === filtro) : citas

  return (
    <div>
      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filtros.map(f => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`px-4 py-2 font-display tracking-wider text-sm transition-colors ${
              filtro === f.value
                ? 'bg-brand-black text-brand-yellow'
                : 'bg-white border border-gray-200 hover:border-gray-400'
            }`}
          >
            {f.label}
            {f.value && (
              <span className="ml-2 text-xs opacity-70">
                ({citas.filter(c => c.estado === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {citasFiltradas.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p className="font-display text-2xl tracking-wider">Sin citas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {citasFiltradas.map((c: Cita & { servicios?: { nombre: string } }) => (
            <div key={c.id} className="card p-5 flex flex-col md:flex-row md:items-center gap-4">
              {/* Fecha/Hora */}
              <div className="flex-shrink-0 w-28 text-center bg-brand-black text-white p-3">
                <p className="font-display text-2xl tracking-wider text-brand-yellow">{c.hora.slice(0, 5)}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(c.fecha + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                </p>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold">{c.nombre_cliente}</p>
                    <p className="text-sm text-gray-500">{c.telefono}{c.email ? ` · ${c.email}` : ''}</p>
                  </div>
                </div>
                <div className="mt-1 flex gap-4 flex-wrap text-sm text-gray-500">
                  <span>🚗 {c.vehiculo}{c.placa ? ` (${c.placa})` : ''}</span>
                  {c.servicios && <span>🔧 {c.servicios.nombre}</span>}
                </div>
                {c.notas && <p className="text-xs text-gray-400 mt-1 italic">"{c.notas}"</p>}
              </div>

              {/* Estado y acciones */}
              <div className="flex-shrink-0 flex flex-col items-end gap-2">
                <span className={`badge ${estadoConfig[c.estado].color}`}>
                  {estadoConfig[c.estado].label}
                </span>

                <div className="flex gap-2">
                  {estadosSiguientes[c.estado].map(s => (
                    <button
                      key={s}
                      onClick={() => actualizarEstado(c.id, s)}
                      disabled={loading === c.id}
                      className={`text-xs px-3 py-1.5 font-semibold transition-colors disabled:opacity-50 ${
                        s === 'cancelada'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : s === 'completada'
                          ? 'bg-green-50 text-green-600 hover:bg-green-100'
                          : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      {loading === c.id ? '...' : estadoConfig[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
