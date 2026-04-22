'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Producto, ProductoSeleccionado, Promocion } from '@/types'
import { CheckCircle, Tag, X, AlertCircle, Loader2 } from 'lucide-react'

const cantidades = [1, 2, 3, 4]

type PromoAplicada = {
  promo: Promocion
  descuento: number
  productosAplicados: number[]
}

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

  // Promo
  const [codigoInput, setCodigoInput] = useState('')
  const [promoAplicada, setPromoAplicada] = useState<PromoAplicada | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')

  const toggleProducto = (id: number) => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const calcularDescuento = (promo: Promocion, ids: number[], cant: number): { descuento: number; productosAplicados: number[] } => {
    const aplicables = productos.filter(p => {
      if (!ids.includes(p.id)) return false
      if (promo.aplica_a === 'todo') return true
      if (promo.aplica_a === 'marca') return p.marca.toUpperCase() === (promo.aplica_valor ?? '').toUpperCase()
      if (promo.aplica_a === 'categoria') return p.categoria === promo.aplica_valor
      return false
    })

    const productosAplicados = aplicables.map(p => p.id)
    const subtotalAplicable = aplicables.reduce((acc, p) => acc + p.precio * cant, 0)

    const descuento = promo.tipo === 'porcentaje'
      ? subtotalAplicable * (promo.valor / 100)
      : Math.min(promo.valor, subtotalAplicable)

    return { descuento, productosAplicados }
  }

  const aplicarPromo = async () => {
    if (!codigoInput.trim()) return
    setPromoLoading(true)
    setPromoError('')
    setPromoAplicada(null)

    const { data: promo, error: err } = await supabase
      .from('promociones')
      .select('*')
      .eq('codigo', codigoInput.trim().toUpperCase())
      .single()

    if (err || !promo) {
      setPromoError('Código no encontrado.')
      setPromoLoading(false)
      return
    }

    if (!promo.activo) {
      setPromoError('Este código está inactivo.')
      setPromoLoading(false)
      return
    }

    const hoy = new Date().toISOString().split('T')[0]
    if (promo.fecha_inicio && promo.fecha_inicio > hoy) {
      setPromoError('Este código aún no está vigente.')
      setPromoLoading(false)
      return
    }
    if (promo.fecha_fin && promo.fecha_fin < hoy) {
      setPromoError('Este código ha vencido.')
      setPromoLoading(false)
      return
    }
    if (promo.usos_maximos !== null && promo.usos_actuales >= promo.usos_maximos) {
      setPromoError('Este código ya alcanzó su límite de usos.')
      setPromoLoading(false)
      return
    }

    const { descuento, productosAplicados } = calcularDescuento(promo, seleccionados, cantidad)

    if (seleccionados.length > 0 && productosAplicados.length === 0) {
      setPromoError(
        promo.aplica_a === 'marca'
          ? `Este código solo aplica para productos de la marca ${promo.aplica_valor}.`
          : `Este código solo aplica para la categoría ${promo.aplica_valor}.`
      )
      setPromoLoading(false)
      return
    }

    setPromoAplicada({ promo, descuento, productosAplicados })
    setPromoLoading(false)
  }

  const quitarPromo = () => {
    setPromoAplicada(null)
    setCodigoInput('')
    setPromoError('')
  }

  // Recalcular descuento cuando cambia selección o cantidad
  const promoActualizada = promoAplicada
    ? calcularDescuento(promoAplicada.promo, seleccionados, cantidad)
    : null

  const subtotal = productos
    .filter(p => seleccionados.includes(p.id))
    .reduce((acc, p) => acc + p.precio * cantidad + p.precio_instalacion, 0)

  const descuento = promoActualizada?.descuento ?? 0
  const total = Math.max(0, subtotal - descuento)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const productosSeleccionados: ProductoSeleccionado[] = productos
      .filter(p => seleccionados.includes(p.id))
      .map(p => ({ producto_id: p.id, nombre: p.nombre, precio: p.precio, cantidad }))

    const { error: err } = await supabase.from('cotizaciones').insert({
      nombre_cliente: nombre,
      telefono,
      email: email || null,
      vehiculo,
      medida_llanta: medida,
      cantidad,
      productos_seleccionados: productosSeleccionados.length > 0 ? productosSeleccionados : null,
      total_estimado: total > 0 ? total : null,
      notas: [
        notas,
        promoAplicada ? `Cupón: ${promoAplicada.promo.codigo} (−$${descuento.toLocaleString('es-MX', { minimumFractionDigits: 2 })})` : '',
      ].filter(Boolean).join(' | ') || null,
    })

    if (!err && promoAplicada) {
      await supabase
        .from('promociones')
        .update({ usos_actuales: promoAplicada.promo.usos_actuales + 1 })
        .eq('id', promoAplicada.promo.id)
    }

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
          onClick={() => {
            setStep('form')
            setNombre(''); setTelefono(''); setEmail(''); setVehiculo('')
            setMedida(''); setSeleccionados([]); setNotas('')
            quitarPromo()
          }}
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
                  cantidad === n ? 'bg-brand-black text-brand-yellow' : 'border border-gray-300 hover:border-brand-black'
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
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {productos.map(p => (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border ${
                    seleccionados.includes(p.id) ? 'border-brand-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={seleccionados.includes(p.id)}
                    onChange={() => {
                      toggleProducto(p.id)
                      // Recalcular si hay promo activa
                      if (promoAplicada) setPromoAplicada(pa => pa ? { ...pa } : null)
                    }}
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

        {/* Cupón de descuento */}
        <div className="card p-4">
          <p className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <Tag size={14} /> Código de promoción
          </p>

          {promoAplicada ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-green-700 font-mono">{promoAplicada.promo.codigo}</p>
                <p className="text-xs text-green-600">{promoAplicada.promo.descripcion}</p>
              </div>
              <button type="button" onClick={quitarPromo} className="text-green-600 hover:text-red-500 transition-colors ml-3">
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                className="input-field flex-1 font-mono uppercase text-sm"
                placeholder="ej: BUENFIN24"
                value={codigoInput}
                onChange={e => { setCodigoInput(e.target.value.toUpperCase()); setPromoError('') }}
              />
              <button
                type="button"
                onClick={aplicarPromo}
                disabled={!codigoInput.trim() || promoLoading}
                className="btn-primary text-sm px-4 py-2 disabled:opacity-50 flex items-center gap-1.5"
              >
                {promoLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                Aplicar
              </button>
            </div>
          )}

          {promoError && (
            <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
              <AlertCircle size={12} /> {promoError}
            </p>
          )}
        </div>

        {/* Total estimado */}
        {subtotal > 0 && (
          <div className="bg-brand-black text-white p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Subtotal ({cantidad} llanta{cantidad > 1 ? 's' : ''} + instalación)</span>
              <span>${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            {descuento > 0 && (
              <div className="flex justify-between text-sm text-green-400">
                <span>Descuento ({promoAplicada?.promo.codigo})</span>
                <span>−${descuento.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Total estimado</p>
                {promoActualizada && promoActualizada.productosAplicados.length < seleccionados.length && (
                  <p className="text-xs text-yellow-400 mt-0.5">
                    * Descuento aplica solo a {promoActualizada.productosAplicados.length} producto(s)
                  </p>
                )}
              </div>
              <p className="font-display text-3xl text-brand-yellow tracking-wider">
                ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full text-center disabled:opacity-50">
          {loading ? 'ENVIANDO...' : 'SOLICITAR COTIZACIÓN'}
        </button>
      </div>
    </form>
  )
}
