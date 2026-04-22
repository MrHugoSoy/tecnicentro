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
    if (!isNaN(n) && n >= 0) {
      setEditStock(prev => ({ ...prev, [id]: n }))
    }
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
      <tr key={p.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${modificado ? 'bg-yellow-50' : ''}`}>
        {/* Miniatura */}
        <td className="pl-4 py-3 w-14 hidden sm:table-cell">
          <div className="w-10 h-10 bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {p.imagen_url ? (
              <Image src={p.imagen_url} alt={p.nombre} width={40} height={40} className="object-contain" />
            ) : (
              <span className="text-lg text-gray-300">⭕</span>
            )}
          </div>
        </td>

        {/* Info del producto */}
        <td className="px-4 py-3">
          <p className="font-semibold text-sm leading-tight">{p.nombre}</p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
            <span className="text-xs text-gray-500">{p.marca}</span>
            {p.codigo && <span className="text-xs text-gray-400">#{p.codigo}</span>}
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs font-medium text-brand-black">{p.medida}</span>
            <span className="text-xs text-gray-400">· {p.categoria}</span>
            {p.origen && <span className="text-xs text-gray-400">· 🌎 {p.origen}</span>}
          </div>
        </td>

        {/* Control de stock */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => cambiarStock(p.id, p.stock, -1)}
              className="w-7 h-7 flex items-center justify-center border border-gray-300 hover:border-red-400 hover:text-red-500 transition-colors"
            >
              <Minus size={12} />
            </button>
            <input
              type="number"
              min="0"
              value={stockActual}
              onChange={e => setManual(p.id, e.target.value)}
              className={`w-16 text-center border font-display text-xl tracking-wider py-1 focus:outline-none ${nivel} ${modificado ? 'border-yellow-400' : 'border-gray-200'}`}
            />
            <button
              onClick={() => cambiarStock(p.id, p.stock, 1)}
              className="w-7 h-7 flex items-center justify-center border border-gray-300 hover:border-green-400 hover:text-green-500 transition-colors"
            >
              <Plus size={12} />
            </button>
            {modificado && (
              <button
                onClick={() => guardar(p.id, p.stock)}
                disabled={saving === p.id}
                className="flex items-center gap-1.5 text-xs bg-brand-black text-white px-3 py-1.5 hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {saving === p.id ? '...' : <><Check size={12} /> Guardar</>}
              </button>
            )}
            {saved === p.id && !modificado && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <Check size={12} /> Guardado
              </span>
            )}
          </div>
        </td>
      </tr>
    )
  }

  return (
    <div className="space-y-8">
      {stockBajo.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <h2 className="font-display tracking-wider text-red-600">STOCK BAJO O AGOTADO ({stockBajo.length})</h2>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-red-50 border-b">
                <tr>
                  <th className="hidden sm:table-cell px-4 py-2 w-14"></th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-600">Producto</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-600">Stock</th>
                </tr>
              </thead>
              <tbody>{stockBajo.map(renderFila)}</tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <h2 className="font-display tracking-wider text-gray-700">STOCK NORMAL ({stockOk.length})</h2>
        </div>
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="hidden sm:table-cell px-4 py-2 w-14"></th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Producto</th>
                <th className="text-left px-4 py-2 font-semibold text-gray-600">Stock</th>
              </tr>
            </thead>
            <tbody>{stockOk.map(renderFila)}</tbody>
          </table>
          {stockOk.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">Sin productos con stock normal</div>
          )}
        </div>
      </div>
    </div>
  )
}
