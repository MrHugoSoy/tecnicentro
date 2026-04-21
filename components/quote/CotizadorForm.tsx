'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Producto, ProductoSeleccionado } from '@/types'
import { CheckCircle } from 'lucide-react'

const cantidades = [1, 2, 3, 4]

export default function CotizadorForm({ productos }: { productos: Producto[] }) {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [vehiculo, setVehiculo] = useState('')
  const [medida, setMedida] = useState('')
  const [cantidad, setCantidad] = useState(4)
  const [seleccionados, setSeleccionados] = useState<number[]>([])
  const [notas, setNotas] = useState('')

  const toggleProducto = (id: number) => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const total = productos
    .filter(p => seleccionados.includes(p.id))
    .reduce((acc, p) => acc + (p.precio + p.precio_instalacion) * cantidad, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const productosSeleccionados: ProductoSeleccionado[] = productos
      .filter(p => seleccionados.includes(p.id))
      .map(p => ({
        producto_id: p.id,
        nombre: p.nombre,
        precio: p.precio,
        cantidad,
      }))

    const { error: err } = await supabase.from('cotizaciones').insert({
      nombre_cliente: nombre,
      telefono,
      email: email || null,
      vehiculo,
      medida_llanta: medida,
      cantidad,
      productos_seleccionados: productosSeleccionados.length > 0 ? productosSeleccionados : null,
      total_estimado: total > 0 ? total : null,
      notas: notas || null,
    })

    setLoading(false)
    if (err) {
      setError('Hubo un error al enviar. Intenta de nuevo.')
    } else {
      setStep('success')
    }
  }

  if (step === 'success') {
    return (
      <div className="card p-12 text-center">
        <div className="w-16 h-16 bg-brand-yellow flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-brand-black" />
        </div>
        <h2 className="font-display text-3xl tracking-wider mb-3">¡COTIZACIÓN ENVIADA!</h2>
        <p className="text-gray-500 mb-6">
          Recibimos tu solicitud. Te contactaremos pronto al {telefono}.
        </p>
        <button
          onClick={() => { setStep('form'); setNombre(''); setTelefono(''); setEmail(''); setVehiculo(''); setMedida(''); setSeleccionados([]); setNotas('') }}
          className="btn-primary"
        >
          Nueva Cotización
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
      {/* Datos de contacto */}
      <div className="card p-6 space-y-4">
        <h2 className="font-display text-xl tracking-wider mb-2">DATOS DE CONTACTO</h2>

        <div>
          <label className="text-sm font-semibold block mb-1">Nombre *</label>
          <input className="input-field" value={nombre} onChange={e => setNombre(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Teléfono *</label>
          <input className="input-field" type="tel" value={telefono} onChange={e => setTelefono(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Email (opcional)</label>
          <input className="input-field" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Vehículo (marca, modelo, año) *</label>
          <input className="input-field" placeholder="ej: Honda Civic 2020" value={vehiculo} onChange={e => setVehiculo(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Medida de llanta *</label>
          <input className="input-field" placeholder="ej: 205/55R16" value={medida} onChange={e => setMedida(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Cantidad de llantas</label>
          <div className="flex gap-2">
            {cantidades.map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setCantidad(n)}
                className={`w-12 h-12 font-display text-lg tracking-wider transition-colors ${
                  cantidad === n
                    ? 'bg-brand-black text-brand-yellow'
                    : 'border border-gray-300 hover:border-brand-black'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold block mb-1">Notas adicionales</label>
          <textarea className="input-field" rows={3} value={notas} onChange={e => setNotas(e.target.value)} placeholder="Dudas o especificaciones..." />
        </div>
      </div>

      {/* Selección de productos */}
      <div className="space-y-4">
        <div className="card p-6">
          <h2 className="font-display text-xl tracking-wider mb-4">LLANTAS DISPONIBLES</h2>
          <p className="text-sm text-gray-500 mb-4">Selecciona los modelos que te interesan (opcional)</p>

          {productos.length === 0 ? (
            <p className="text-gray-400 text-sm">No hay llantas disponibles en este momento.</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {productos.map(p => (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border ${
                    seleccionados.includes(p.id)
                      ? 'border-brand-black bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={seleccionados.includes(p.id)}
                    onChange={() => toggleProducto(p.id)}
                    className="accent-brand-black"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{p.nombre}</p>
                    <p className="text-xs text-gray-500">{p.medida}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display text-sm">${p.precio.toLocaleString('es-MX')}</p>
                    {p.precio_instalacion > 0 && (
                      <p className="text-xs text-gray-400">+${p.precio_instalacion} inst.</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Total estimado */}
        {total > 0 && (
          <div className="bg-brand-black text-white p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Total estimado</p>
              <p className="font-display text-sm text-gray-300">{cantidad} llantas + instalación</p>
            </div>
            <p className="font-display text-3xl text-brand-yellow tracking-wider">
              ${total.toLocaleString('es-MX')}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full text-center disabled:opacity-50">
          {loading ? 'ENVIANDO...' : 'SOLICITAR COTIZACIÓN'}
        </button>
      </div>
    </form>
  )
}
