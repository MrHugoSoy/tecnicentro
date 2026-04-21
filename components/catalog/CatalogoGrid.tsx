'use client'

import { useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { Producto } from '@/types'

const categorias = [
  { value: '', label: 'Todos' },
  { value: 'llanta', label: 'Llantas' },
  { value: 'rin', label: 'Rines' },
  { value: 'accesorio', label: 'Accesorios' },
]

export default function CatalogoGrid({ productos }: { productos: Producto[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [busqueda, setBusqueda] = useState(searchParams.get('q') ?? '')

  const categoria = searchParams.get('categoria') ?? ''

  const filtrar = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }

  const buscar = (e: React.FormEvent) => {
    e.preventDefault()
    filtrar('q', busqueda)
  }

  return (
    <div>
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={buscar} className="flex gap-2 flex-1">
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o medida..."
            className="input-field flex-1"
          />
          <button type="submit" className="bg-brand-black text-white px-4 py-3 hover:bg-gray-800 transition-colors">
            <Search size={20} />
          </button>
        </form>

        <div className="flex gap-2">
          {categorias.map(c => (
            <button
              key={c.value}
              onClick={() => filtrar('categoria', c.value)}
              className={`px-4 py-2 font-display tracking-wider text-sm transition-colors ${
                categoria === c.value
                  ? 'bg-brand-black text-brand-yellow'
                  : 'bg-white border border-gray-200 text-brand-black hover:border-brand-black'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {productos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <SlidersHorizontal size={40} className="mx-auto mb-4 opacity-30" />
          <p className="font-display text-2xl tracking-wider">Sin resultados</p>
          <p className="text-sm mt-2">Intenta con otros filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productos.map(p => (
            <ProductoCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductoCard({ producto: p }: { producto: Producto }) {
  return (
    <div className="card group">
      {/* Imagen */}
      <div className="aspect-square bg-gray-50 relative overflow-hidden">
        {p.imagen_url ? (
          <Image src={p.imagen_url} alt={p.nombre} fill className="object-contain p-4" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-200">
            ⭕
          </div>
        )}
        {p.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-display tracking-wider text-sm">AGOTADO</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <span className="badge-yellow text-xs mb-2">{p.medida}</span>
        <h3 className="font-display text-lg tracking-wider mb-1 leading-tight">{p.nombre}</h3>
        {p.descripcion && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.descripcion}</p>
        )}

        <div className="flex items-end justify-between mt-2">
          <div>
            <p className="font-display text-2xl tracking-wider text-brand-black">
              ${p.precio.toLocaleString('es-MX')}
            </p>
            {p.precio_instalacion > 0 && (
              <p className="text-xs text-gray-400">+ ${p.precio_instalacion} instalación</p>
            )}
          </div>
          <Link
            href={`/cotizador?producto=${p.id}`}
            className="bg-brand-yellow text-brand-black font-display tracking-wider text-xs px-3 py-2 hover:bg-yellow-400 transition-colors"
          >
            COTIZAR
          </Link>
        </div>
      </div>
    </div>
  )
}
