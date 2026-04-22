'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Producto } from '@/types'
import { Plus, Pencil, Trash2, X } from 'lucide-react'

type FormData = Omit<Producto, 'id' | 'created_at' | 'updated_at'>

const defaultForm: FormData = {
  nombre: '',
  marca: 'Goodyear',
  medida: '',
  descripcion: '',
  precio: 0,
  precio_instalacion: 0,
  stock: 0,
  imagen_url: null,
  origen: null,
  categoria: 'llanta',
  activo: true,
}

export default function ProductosAdmin({ productos: initial }: { productos: Producto[] }) {
  const [productos, setProductos] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<FormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState('')

  const abrirNuevo = () => {
    setEditId(null)
    setForm(defaultForm)
    setImageFile(null)
    setImagePreview(null)
    setUploadError('')
    setShowForm(true)
    setError('')
  }

  const abrirEditar = (p: Producto) => {
    setEditId(p.id)
    setForm({
      nombre: p.nombre, marca: p.marca, medida: p.medida,
      descripcion: p.descripcion ?? '', precio: p.precio,
      precio_instalacion: p.precio_instalacion, stock: p.stock,
      imagen_url: p.imagen_url, origen: p.origen, categoria: p.categoria, activo: p.activo,
    })
    setImageFile(null)
    setImagePreview(p.imagen_url ?? null)
    setUploadError('')
    setShowForm(true)
    setError('')
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setUploadError('')
  }

  const guardar = async () => {
    if (!form.nombre || !form.medida || form.precio <= 0) {
      setError('Nombre, medida y precio son requeridos.')
      return
    }
    setLoading(true)
    setError('')

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('productos')
        .upload(path, imageFile, { upsert: true })
      if (uploadErr) {
        setUploadError(`Error al subir imagen: ${uploadErr.message}`)
        setLoading(false)
        return
      }
      const { data: { publicUrl } } = supabase.storage.from('productos').getPublicUrl(path)
      form.imagen_url = publicUrl
    }

    if (editId) {
      const { data, error: err } = await supabase
        .from('productos')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', editId)
        .select()
        .single()
      if (err) setError(err.message)
      else {
        setProductos(prev => prev.map(p => p.id === editId ? data : p))
        setShowForm(false)
      }
    } else {
      const { data, error: err } = await supabase
        .from('productos')
        .insert(form)
        .select()
        .single()
      if (err) setError(err.message)
      else {
        setProductos(prev => [data, ...prev])
        setShowForm(false)
      }
    }
    setLoading(false)
  }

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return
    const { error } = await supabase.from('productos').delete().eq('id', id)
    if (!error) setProductos(prev => prev.filter(p => p.id !== id))
  }

  const toggleActivo = async (p: Producto) => {
    const { error } = await supabase.from('productos').update({ activo: !p.activo }).eq('id', p.id)
    if (!error) setProductos(prev => prev.map(x => x.id === p.id ? { ...x, activo: !p.activo } : x))
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={abrirNuevo} className="btn-primary flex items-center gap-2 text-sm py-2">
          <Plus size={16} /> Nuevo producto
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-display text-2xl tracking-wider">
                {editId ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}
              </h2>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-semibold block mb-1">Nombre *</label>
                <input className="input-field" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">Marca</label>
                <input className="input-field" value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">Medida * (ej: 205/55R16)</label>
                <input className="input-field" value={form.medida} onChange={e => setForm(f => ({ ...f, medida: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">Categoría</label>
                <select className="input-field" value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value as any }))}>
                  <option value="llanta">Llanta</option>
                  <option value="rin">Rin</option>
                  <option value="accesorio">Accesorio</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">Stock</label>
                <input className="input-field" type="number" min="0" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: +e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">Precio (MXN) *</label>
                <input className="input-field" type="number" min="0" step="0.01" value={form.precio} onChange={e => setForm(f => ({ ...f, precio: +e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">Precio instalación (MXN)</label>
                <input className="input-field" type="number" min="0" step="0.01" value={form.precio_instalacion} onChange={e => setForm(f => ({ ...f, precio_instalacion: +e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold block mb-1">Descripción</label>
                <textarea className="input-field" rows={3} value={form.descripcion ?? ''} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-semibold block mb-1">Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:bg-brand-black file:text-white file:text-xs file:font-semibold file:cursor-pointer cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-3">
                    <img src={imagePreview} alt="Preview" className="h-32 object-contain border border-gray-200 bg-gray-50 p-1" />
                  </div>
                )}
                {uploadError && (
                  <p className="mt-1 text-xs text-red-600">{uploadError}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">País de origen</label>
                <input
                  className="input-field"
                  value={form.origen ?? ''}
                  onChange={e => setForm(f => ({ ...f, origen: e.target.value || null }))}
                  placeholder="Ej: México, Estados Unidos, China..."
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="activo" checked={form.activo} onChange={e => setForm(f => ({ ...f, activo: e.target.checked }))} className="accent-brand-black" />
                <label htmlFor="activo" className="text-sm font-semibold">Visible en catálogo</label>
              </div>
            </div>

            {error && (
              <div className="mx-6 mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
            )}

            <div className="p-6 border-t flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="btn-outline text-sm py-2 px-4">Cancelar</button>
              <button onClick={guardar} disabled={loading} className="btn-primary text-sm py-2 px-6 disabled:opacity-50">
                {loading ? 'GUARDANDO...' : 'GUARDAR'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Producto</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Medida</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600">Precio</th>
              <th className="text-right px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Stock</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {productos.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold">{p.nombre}</p>
                  <p className="text-xs text-gray-400">{p.categoria}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-600">{p.medida}</td>
                <td className="px-4 py-3 text-right">
                  <p className="font-display tracking-wider">${p.precio.toLocaleString('es-MX')}</p>
                  {p.precio_instalacion > 0 && (
                    <p className="text-xs text-gray-400">+${p.precio_instalacion} inst.</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  <span className={`font-display text-lg tracking-wider ${p.stock === 0 ? 'text-red-500' : p.stock <= 3 ? 'text-orange-500' : 'text-green-600'}`}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleActivo(p)}
                    className={`badge ${p.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                  >
                    {p.activo ? 'Activo' : 'Oculto'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => abrirEditar(p)} className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-500">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => eliminar(p.id)} className="p-1.5 hover:bg-red-50 rounded transition-colors text-red-400">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {productos.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="font-display text-xl tracking-wider">Sin productos</p>
            <p className="text-sm mt-2">Agrega tu primer producto con el botón de arriba</p>
          </div>
        )}
      </div>
    </div>
  )
}
