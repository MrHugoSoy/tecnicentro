'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Servicio } from '@/types'
import { CheckCircle, Clock, DollarSign } from 'lucide-react'

// Horarios disponibles
const horarios = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30',
]

// Fecha mínima = hoy
const hoy = new Date().toISOString().split('T')[0]

export default function AgendarForm({ servicios }: { servicios: Servicio[] }) {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [vehiculo, setVehiculo] = useState('')
  const [placa, setPlaca] = useState('')
  const [servicioId, setServicioId] = useState<number | ''>('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [notas, setNotas] = useState('')

  const servicioSeleccionado = servicios.find(s => s.id === servicioId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fecha || !hora) { setError('Selecciona fecha y hora.'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.from('citas').insert({
      nombre_cliente: nombre,
      telefono,
      email: email || null,
      vehiculo,
      placa: placa || null,
      servicio_id: servicioId || null,
      notas: notas || null,
      fecha,
      hora,
    })

    setLoading(false)
    if (err) setError('Hubo un error. Intenta de nuevo.')
    else setStep('success')
  }

  if (step === 'success') {
    return (
      <div className="card p-12 text-center">
        <div className="w-16 h-16 bg-brand-yellow flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-brand-black" />
        </div>
        <h2 className="font-display text-3xl tracking-wider mb-3">¡CITA AGENDADA!</h2>
        <p className="text-gray-500 mb-2">
          Tu cita está registrada para el <strong>{fecha}</strong> a las <strong>{hora}</strong>.
        </p>
        <p className="text-gray-500 mb-8">Te confirmaremos al {telefono}.</p>
        <button
          onClick={() => { setStep('form'); setNombre(''); setTelefono(''); setEmail(''); setVehiculo(''); setPlaca(''); setServicioId(''); setFecha(''); setHora(''); setNotas('') }}
          className="btn-outline"
        >
          Agendar otra cita
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Datos personales */}
      <div className="card p-6 space-y-4">
        <h2 className="font-display text-xl tracking-wider">TUS DATOS</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold block mb-1">Nombre completo *</label>
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
            <label className="text-sm font-semibold block mb-1">Vehículo *</label>
            <input className="input-field" placeholder="Honda Civic 2020" value={vehiculo} onChange={e => setVehiculo(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Placa (opcional)</label>
            <input className="input-field" placeholder="ABC-1234" value={placa} onChange={e => setPlaca(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Servicio */}
      <div className="card p-6">
        <h2 className="font-display text-xl tracking-wider mb-4">SERVICIO</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {servicios.map(s => (
            <label
              key={s.id}
              className={`flex flex-col p-4 cursor-pointer border transition-colors ${
                servicioId === s.id
                  ? 'border-brand-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                name="servicio"
                value={s.id}
                checked={servicioId === s.id}
                onChange={() => setServicioId(s.id)}
                className="sr-only"
              />
              <span className="font-semibold text-sm mb-1">{s.nombre}</span>
              <div className="flex gap-4 text-xs text-gray-500 mt-auto pt-2">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {s.duracion_minutos} min
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign size={12} />
                  {s.precio === 0 ? 'Gratis' : `$${s.precio.toLocaleString('es-MX')}`}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Fecha y hora */}
      <div className="card p-6">
        <h2 className="font-display text-xl tracking-wider mb-4">FECHA Y HORA</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-semibold block mb-1">Fecha *</label>
            <input
              type="date"
              className="input-field"
              min={hoy}
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-2">Hora *</label>
            <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
              {horarios.map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setHora(h)}
                  className={`py-2 text-xs font-display tracking-wider transition-colors ${
                    hora === h
                      ? 'bg-brand-black text-brand-yellow'
                      : 'border border-gray-200 hover:border-brand-black'
                  }`}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resumen seleccionado */}
        {fecha && hora && (
          <div className="mt-4 bg-brand-yellow/10 border border-brand-yellow px-4 py-3 text-sm">
            <span className="font-semibold">Tu cita: </span>
            {new Date(fecha + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })} a las {hora}
            {servicioSeleccionado && ` — ${servicioSeleccionado.nombre}`}
          </div>
        )}
      </div>

      {/* Notas */}
      <div>
        <label className="text-sm font-semibold block mb-1">Notas adicionales (opcional)</label>
        <textarea
          className="input-field"
          rows={3}
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Describe el problema o cualquier detalle que necesitemos saber..."
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full text-center disabled:opacity-50">
        {loading ? 'AGENDANDO...' : 'CONFIRMAR CITA'}
      </button>
    </form>
  )
}
