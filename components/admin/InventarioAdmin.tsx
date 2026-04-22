'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Minus, Check } from 'lucide-react'
import Image from 'next/image'

type ProductoStock = {
  id: number
  nombre: string
  marca: string
  codigo: string | null
  medida: string
  categoria: string
  origen: string | null
  stock: number
  activo: boolean
  imagen_url: string | null
}

export default function InventarioAdmin({ productos: initial }: { productos: ProductoStock[] }) {
  const [productos, setProductos] = useState(initial)
  const [editStock, setEditStock] = useState<Record<number, number>>({})
  const [saving, setSaving] = useState<number | null>(null)
  const [saved, setSaved] = useState<number | null>(null)

  const getStock = (id: number, original: number) =>
    editStock[id] !== undefined ? editStock[id] : original

  const cambiarStock = (id: number, original: number, delta: number) => {
    const actual = getStock(id, original)
    const nuevo = Math.max(0, actual + delta)
    setEditStock(prev => ({ ...prev, [id]: nuevo }))
  }

  const setManual = (id: number, val: string) => {
    const n = parseInt(val)
    if (!isNaN(n) && n >= 0) setEditStock(prev => ({ ...prev, [id]: n }))
  }

  const guardar = async (id: number, original: number) => {
    const nuevo = getStock(id, original)
    if (nuevo === original) return
    setSaving(id)
    const { error } = await supabase
      .from('productos')
      .update({ stock: nuevo, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) {
      setProductos(prev => prev.map(p => p.id === id ? { ...p, stock: nuevo } : p))
      setEditStock(prev => { const n = { ...prev }; delete n[id]; return n })
      setSaved(id)
      setTimeout(() => setSaved(null), 2000)
    }
    setSaving(null)
  }

  const stockBajo = productos.filter(p => p.stock <= 3)
  const stockOk = productos.filter(p => p.stock > 3)

  const renderFila = (p: ProductoStock) => {
    const stockActual = getStock(p.id, p.stock)
    const modificado = stockActual !== p.stock
    const nivel = stockActual === 0 ? 'text-red-600' : stockActual <= 3 ? 'text-orange-500' : 'text-green-600'

    return (
      <div
        key={p.id}
        className={`flex items-center gap-4 px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${modificado ? 'bg-yellow-50' : ''}`}
      >
        {/* Miniatura */}
        <div className="w-12 h-12 bg-gray-100 items-center justify-center flex-shrink-0 hidden sm:flex">
          {p.imagen_url ? (
            <Image src={p.imagen_url} alt={p.nombre} width={48} height={48} className="object-contain" />
          ) : (
            <span className="text-xl text-gray-300">⭕</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{p.nombre}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
            <span className="text-xs text-gray-600 font-medium">{p.marca}</span>
            {p.codigo && <span className="text-xs text-gray-400">#{p.codigo}</span>}
            <span className="text-xs bg-brand-yellow/20 text-brand-black px-1.5 py-0.5 font-medium">{p.medida}</span>
            {p.origen && <span className="text-xs text-gray-400">🌎 {p.origen}</span>}
          </div>
        </div>

        {/* Control stock — ancho fijo para que el botón no desplace */}
        <div className="flex items-center gap-2 flex-shrink-0 w-64 justify-end">
          <button
            onClick={() => cambiarStock(p.id, p.stock, -1)}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-red-400 hover:text-red-500 transition-colors flex-shrink-0"
          >
            <Minus size={13} />
          </button>
          <input
            type="number"
            min="0"
            value={stockActual}
            onChange={e => setManual(p.id, e.target.value)}
            className={`w-16 text-center border font-display text-xl tracking-wider py-1.5 focus:outline-none flex-shrink-0 ${nivel} ${modificado ? 'border-yellow-400' : 'border-gray-200'}`}
          />
          <button
            onClick={() => cambiarStock(p.id, p.stock, 1)}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:border-green-400 hover:text-green-500 transition-colors flex-shrink-0"
          >
            <Plus size={13} />
          </button>

          {/* Espacio reservado fijo para evitar desplazamiento */}
          <div className="w-24 flex items-center justify-start">
            {modificado ? (
              <button
                onClick={() => guardar(p.id, p.stock)}
                disabled={saving === p.id}
                className="flex items-center gap-1.5 text-xs bg-brand-black text-white px-3 py-1.5 hover:bg-gray-800 disabled:opacity-50 transition-colors w-full justify-center"
              >
                {saving === p.id ? '...' : <><Check size={12} /> Guardar</>}
              </button>
            ) : saved === p.id ? (
              <span className="text-xs text-green-600 flex items-center gap-1 w-full justify-center">
                <Check size={12} /> Guardado
              </span>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  const Seccion = ({ titulo, color, items, headerColor }: {
    titulo: string
    color: string
    items: ProductoStock[]
    headerColor: string
  }) => (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <h2 className={`font-display tracking-wider ${color === 'bg-red-500' ? 'text-red-600' : 'text-gray-700'}`}>
          {titulo} ({items.length})
        </h2>
      </div>
      <div className={`card overflow-hidden`}>
        <div className={`flex items-center gap-4 px-4 py-2 border-b ${headerColor}`}>
          <div className="w-12 hidden sm:block flex-shrink-0" />
          <p className="flex-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</p>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider w-64 text-right pr-1">Stock</p>
        </div>
        {items.length === 0
          ? <div className="text-center py-8 text-gray-400 text-sm">Sin productos</div>
          : items.map(renderFila)
        }
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {stockBajo.length > 0 && (
        <Seccion titulo="STOCK BAJO O AGOTADO" color="bg-red-500" items={stockBajo} headerColor="bg-red-50" />
      )}
      <Seccion titulo="STOCK NORMAL" color="bg-green-500" items={stockOk} headerColor="bg-gray-50" />
    </div>
  )
}
