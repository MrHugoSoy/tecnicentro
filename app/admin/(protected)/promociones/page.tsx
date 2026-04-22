'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Promocion } from '@/types'
import { Plus, X, Pencil, Trash2, Tag, ToggleLeft, ToggleRight, Copy } from 'lucide-react'

type FormData = Omit<Promocion, 'id' | 'usos_actuales' | 'created_at'>

const defaultForm: FormData = {
  codigo: '',
  nombre_evento: '',
  descripcion: '',
  tipo: 'porcentaje',
  valor: 10,
  aplica_a: 'todo',
  aplica_valor: null,
  activo: true,
  fecha_inicio: null,
  fecha_fin: null,
  usos_maximos: null,
}

function generarCodigo(evento: string): string {
  const base = evento
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
  const sufijo = Math.floor(10 + Math.random() * 90)
  return base + sufijo
}

export default function PromocionesPage() {
  const [promociones, setPromociones] = useState<Promocion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    const { data } = await supabase
      .from('promociones')
      .select('*')
      .order('created_at', { ascending: false })
    setPromociones(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const abrirNuevo = () => {
    setEditId(null)
    setForm(defaultForm)
    setError('')
    setShowForm(true)
  }

  const abrirEditar = (p: Promocion) => {
    setEditId(p.id)
    setForm({
      codigo: p.codigo,
      nombre_evento: p.nombre_evento,
      descripcion: p.descripcion,
      tipo: p.tipo,
      valor: p.valor,
      aplica_a: p.aplica_a,
      aplica_valor: p.aplica_valor,
      activo: p.activo,
      fecha_inicio: p.fecha_inicio,
      fecha_fin: p.fecha_fin,
      usos_maximos: p.usos_maximos,
    })
    setError('')
    setShowForm(true)
  }

  const guardar = async () => {
    if (!form.codigo.trim() || !form.descripcion.trim() || form.valor <= 0) {
      setError('Código, descripción y valor son requeridos.')
      return
    }
    setSaving(true)
    setError('')

    const payload = {
      ...form,
      codigo: form.codigo.trim().toUpperCase(),
      nombre_evento: form.nombre_evento || null,
      aplica_valor: form.aplica_a === 'todo' ? null : form.aplica_valor,
    }

    if (editId) {
      const { error: err } = await supabase.from('promociones').update(payload).eq('id', editId)
      if (err) { setError(err.message); setSaving(false); return }
      setPromociones(prev => prev.map(p => p.id === editId ? { ...p, ...payload } : p))
    } else {
      const { data, error: err } = await supabase.from('promociones').insert({ ...payload, usos_actuales: 0 }).select().single()
      if (err) { setError(err.message); setSaving(false); return }
      setPromociones(prev => [data, ...prev])
    }

    setSaving(false)
    setShowForm(false)
  }

  const toggleActivo = async (p: Promocion) => {
    const { error: err } = await supabase.from('promociones').update({ activo: !p.activo }).eq('id', p.id)
    if (!err) setPromociones(prev => prev.map(x => x.id === p.id ? { ...x, activo: !p.activo } : x))
  }

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta promoción?')) return
    const { error: err } = await supabase.from('promociones').delete().eq('id', id)
    if (!err) setPromociones(prev => prev.filter(p => p.id !== id))
  }

  const copiar = (codigo: string) => {
    navigator.clipboard.writeText(codigo)
    setCopied(codigo)
    setTimeout(() => setCopied(null), 2000)
  }

  const hoy = new Date().toISOString().split('T')[0]

  const estadoPromo = (p: Promocion) => {
    if (!p.activo) return { label: 'Inactiva', color: 'bg-gray-100 text-gray-500' }
    if (p.fecha_fin && p.fecha_fin < hoy) return { label: 'Vencida', color: 'bg-red-100 text-red-600' }
    if (p.fecha_inicio && p.fecha_inicio > hoy) return { label: 'Programada', color: 'bg-blue-100 text-blue-600' }
    if (p.usos_maximos !== null && p.usos_actuales >= p.usos_maximos) return { label: 'Agotada', color: 'bg-orange-100 text-orange-600' }
    return { label: 'Activa', color: 'bg-green-100 text-green-700' }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl tracking-wider mb-1">PROMOCIONES</h1>
          <p className="text-gray-500 text-sm">Gestiona cupones y descuentos para el cotizador.</p>
        </div>
        <button onClick={abrirNuevo} className="btn-primary flex items-center gap-2 text-sm py-2">
          <Plus size={16} /> Nueva promoción
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-display text-2xl tracking-wider flex items-center gap-2">
                <Tag size={20} /> {editId ? 'EDITAR' : 'NUEVA'} PROMOCIÓN
              </h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Nombre del evento */}
              <div>
                <label className="text-sm font-semibold block mb-1">Nombre del evento</label>
                <div className="flex gap-2">
                  <input
                    className="input-field flex-1"
                    placeholder="ej: Buen Fin, Día del Padre..."
                    value={form.nombre_evento ?? ''}
                    onChange={e => setForm(f => ({ ...f, nombre_evento: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => form.nombre_evento && setForm(f => ({ ...f, codigo: generarCodigo(f.nombre_evento ?? '') }))}
                    className="px-3 py-2 border border-gray-300 text-xs font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    Auto-código
                  </button>
                </div>
              </div>

              {/* Código */}
              <div>
                <label className="text-sm font-semibold block mb-1">Código del cupón *</label>
                <input
                  className="input-field font-mono uppercase"
                  placeholder="ej: BUENFIN24"
                  value={form.codigo}
                  onChange={e => setForm(f => ({ ...f, codigo: e.target.value.toUpperCase() }))}
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="text-sm font-semibold block mb-1">Descripción *</label>
                <input
                  className="input-field"
                  placeholder="ej: 15% de descuento en todas las llantas"
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                />
              </div>

              {/* Tipo y valor */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold block mb-1">Tipo de descuento</label>
                  <select
                    className="input-field"
                    value={form.tipo}
                    onChange={e => setForm(f => ({ ...f, tipo: e.target.value as 'porcentaje' | 'monto_fijo' }))}
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="monto_fijo">Monto fijo ($)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">
                    Valor {form.tipo === 'porcentaje' ? '(%)' : '($)'}
                  </label>
                  <input
                    className="input-field"
                    type="number"
                    min="0"
                    step={form.tipo === 'porcentaje' ? '1' : '0.01'}
                    max={form.tipo === 'porcentaje' ? '100' : undefined}
                    value={form.valor}
                    onChange={e => setForm(f => ({ ...f, valor: +e.target.value }))}
                  />
                </div>
              </div>

              {/* Aplica a */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold block mb-1">Aplica a</label>
                  <select
                    className="input-field"
                    value={form.aplica_a}
                    onChange={e => setForm(f => ({ ...f, aplica_a: e.target.value as Promocion['aplica_a'], aplica_valor: null }))}
                  >
                    <option value="todo">Todo el catálogo</option>
                    <option value="marca">Marca específica</option>
                    <option value="categoria">Categoría</option>
                  </select>
                </div>
                {form.aplica_a !== 'todo' && (
                  <div>
                    <label className="text-sm font-semibold block mb-1">
                      {form.aplica_a === 'marca' ? 'Marca' : 'Categoría'}
                    </label>
                    {form.aplica_a === 'marca' ? (
                      <input
                        className="input-field"
                        placeholder="ej: GOODYEAR"
                        value={form.aplica_valor ?? ''}
                        onChange={e => setForm(f => ({ ...f, aplica_valor: e.target.value }))}
                      />
                    ) : (
                      <select
                        className="input-field"
                        value={form.aplica_valor ?? ''}
                        onChange={e => setForm(f => ({ ...f, aplica_valor: e.target.value }))}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="llanta">Llanta</option>
                        <option value="rin">Rin</option>
                        <option value="accesorio">Accesorio</option>
                      </select>
                    )}
                  </div>
                )}
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold block mb-1">Fecha inicio</label>
                  <input
                    className="input-field"
                    type="date"
                    value={form.fecha_inicio ?? ''}
                    onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value || null }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Fecha fin</label>
                  <input
                    className="input-field"
                    type="date"
                    value={form.fecha_fin ?? ''}
                    onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value || null }))}
                  />
                </div>
              </div>

              {/* Usos máximos */}
              <div>
                <label className="text-sm font-semibold block mb-1">Usos máximos (vacío = ilimitado)</label>
                <input
                  className="input-field"
                  type="number"
                  min="1"
                  placeholder="Sin límite"
                  value={form.usos_maximos ?? ''}
                  onChange={e => setForm(f => ({ ...f, usos_maximos: e.target.value ? +e.target.value : null }))}
                />
              </div>

              {/* Activo */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activo-promo"
                  checked={form.activo}
                  onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))}
                  className="accent-brand-black"
                />
                <label htmlFor="activo-promo" className="text-sm font-semibold">Promoción activa</label>
              </div>

              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2">{error}</p>}
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="btn-outline text-sm py-2 px-4">Cancelar</button>
              <button onClick={guardar} disabled={saving} className="btn-primary text-sm py-2 px-6 disabled:opacity-50">
                {saving ? 'GUARDANDO...' : 'GUARDAR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Cargando...</div>
      ) : promociones.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <Tag size={40} className="mx-auto mb-4 opacity-30" />
          <p className="font-display text-xl tracking-wider">Sin promociones</p>
          <p className="text-sm mt-2">Crea tu primera promoción con el botón de arriba</p>
        </div>
      ) : (
        <div className="space-y-3">
          {promociones.map(p => {
            const estado = estadoPromo(p)
            return (
              <div key={p.id} className="card p-4 flex items-center gap-4">
                {/* Código */}
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-lg tracking-wider text-brand-black">{p.codigo}</span>
                    <button
                      onClick={() => copiar(p.codigo)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copiar código"
                    >
                      <Copy size={14} />
                    </button>
                    {copied === p.codigo && <span className="text-xs text-green-600">¡Copiado!</span>}
                  </div>
                  {p.nombre_evento && <p className="text-xs text-gray-400 mt-0.5">{p.nombre_evento}</p>}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.descripcion}</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    <span className="text-xs font-semibold text-brand-black">
                      {p.tipo === 'porcentaje' ? `${p.valor}% desc.` : `$${p.valor} desc.`}
                    </span>
                    <span className="text-xs text-gray-400">
                      {p.aplica_a === 'todo' ? 'Todo el catálogo' : `${p.aplica_a}: ${p.aplica_valor}`}
                    </span>
                    {(p.fecha_inicio || p.fecha_fin) && (
                      <span className="text-xs text-gray-400">
                        {p.fecha_inicio ?? '—'} → {p.fecha_fin ?? '—'}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {p.usos_actuales} uso{p.usos_actuales !== 1 ? 's' : ''}
                      {p.usos_maximos !== null ? ` / ${p.usos_maximos}` : ''}
                    </span>
                  </div>
                </div>

                {/* Estado + acciones */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`badge text-xs ${estado.color}`}>{estado.label}</span>
                  <button
                    onClick={() => toggleActivo(p)}
                    className={`transition-colors ${p.activo ? 'text-green-600 hover:text-gray-400' : 'text-gray-300 hover:text-green-600'}`}
                    title={p.activo ? 'Desactivar' : 'Activar'}
                  >
                    {p.activo ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                  <button onClick={() => abrirEditar(p)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => eliminar(p.id)} className="p-1.5 hover:bg-red-50 rounded text-red-400 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
