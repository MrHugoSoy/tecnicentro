'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Cotizacion } from '@/types'
import { ChevronDown, ChevronUp } from 'lucide-react'

const estadoConfig = {
  nueva: { label: 'Nueva', color: 'bg-yellow-100 text-yellow-700' },
  enviada: { label: 'Enviada', color: 'bg-blue-100 text-blue-700' },
  convertida: { label: 'Convertida', color: 'bg-green-100 text-green-700' },
}

export default function CotizacionesTable({ cotizaciones: initial }: { cotizaciones: Cotizacion[] }) {
  const [cotizaciones, setCotizaciones] = useState(initial)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [loading, setLoading] = useState<number | null>(null)

  const cambiarEstado = async (id: number, estado: Cotizacion['estado']) => {
    setLoading(id)
    const { error } = await supabase.from('cotizaciones').update({ estado }).eq('id', id)
    if (!error) {
      setCotizaciones(prev => prev.map(c => c.id === id ? { ...c, estado } : c))
    }
    setLoading(null)
  }

  return (
    <div className="space-y-3">
      {cotizaciones.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <p className="font-display text-2xl tracking-wider">Sin cotizaciones</p>
        </div>
      ) : cotizaciones.map(c => (
        <div key={c.id} className="card overflow-hidden">
          <div
            className="p-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer"
            onClick={() => setExpanded(expanded === c.id ? null : c.id)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <p className="font-semibold">{c.nombre_cliente}</p>
                <span className={`badge ${estadoConfig[c.estado].color}`}>{estadoConfig[c.estado].label}</span>
              </div>
              <div className="flex gap-4 text-sm text-gray-500 flex-wrap">
                <span>📱 {c.telefono}</span>
                <span>🚗 {c.vehiculo}</span>
                <span>📐 {c.medida_llanta} × {c.cantidad}</span>
                {c.total_estimado && (
                  <span className="font-semibold text-brand-black">
                    ${c.total_estimado.toLocaleString('es-MX')} est.
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(c.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {c.estado === 'nueva' && (
                <button
                  onClick={e => { e.stopPropagation(); cambiarEstado(c.id, 'enviada') }}
                  disabled={loading === c.id}
                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold disabled:opacity-50"
                >
                  Marcar enviada
                </button>
              )}
              {c.estado === 'enviada' && (
                <button
                  onClick={e => { e.stopPropagation(); cambiarEstado(c.id, 'convertida') }}
                  disabled={loading === c.id}
                  className="text-xs px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 font-semibold disabled:opacity-50"
                >
                  Convertida en venta
                </button>
              )}
              {expanded === c.id ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </div>
          </div>

          {/* Detalle expandido */}
          {expanded === c.id && (
            <div className="border-t border-gray-100 bg-gray-50 p-5 space-y-3">
              {c.email && <p className="text-sm">📧 {c.email}</p>}
              {c.notas && <p className="text-sm text-gray-600 italic">Notas: {c.notas}</p>}
              {c.productos_seleccionados && c.productos_seleccionados.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Productos de interés</p>
                  <div className="space-y-1">
                    {c.productos_seleccionados.map((p, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{p.nombre}</span>
                        <span className="font-semibold">${(p.precio * p.cantidad).toLocaleString('es-MX')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
