'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, AlertCircle } from 'lucide-react'

type ProductoParsed = {
  marca: string
  nombre: string
  medida: string
  origen: string | null
  precio: number
  categoria: 'llanta' | 'rin' | 'accesorio'
  precio_instalacion: number
  stock: number
  activo: boolean
  imagen_url: null
}

function parsearPrecio(raw: string): number {
  return parseFloat(raw.replace(/[$,\s]/g, '')) || 0
}

function extraerMedida(nombre: string): string {
  const match = nombre.match(/\d{2,3}\/\d{2,3}[A-Z]?\d{2,3}[A-Z]*/i)
  return match ? match[0].toUpperCase() : ''
}

function parsearLinea(linea: string): ProductoParsed | null {
  const cols = linea.split('\t').map(c => c.trim())
  if (cols.length < 5) return null

  const marca = cols[0]
  // cols[1] = codigo (ignorar)
  const nombre = cols[2]
  // cols[3] = origen interno (ignorar — viene vacío o es código)
  const precio = parsearPrecio(cols[4])

  if (!marca || !nombre || precio <= 0) return null

  return {
    marca,
    nombre,
    medida: extraerMedida(nombre),
    origen: null,
    precio,
    categoria: 'llanta',
    precio_instalacion: 0,
    stock: 0,
    activo: true,
    imagen_url: null,
  }
}

export default function ImportarPage() {
  const [texto, setTexto] = useState('')
  const [preview, setPreview] = useState<ProductoParsed[]>([])
  const [importando, setImportando] = useState(false)
  const [resultado, setResultado] = useState<{ ok: number; err: number } | null>(null)
  const [error, setError] = useState('')

  const parsear = () => {
    setResultado(null)
    setError('')
    const lineas = texto.split('\n').filter(l => l.trim())
    const productos = lineas.map(parsearLinea).filter(Boolean) as ProductoParsed[]
    if (productos.length === 0) {
      setError('No se detectaron productos. Verifica que el formato sea correcto (columnas separadas por Tab).')
    }
    setPreview(productos)
  }

  const importar = async () => {
    if (preview.length === 0) return
    setImportando(true)
    setError('')
    setResultado(null)

    // Insertar en lotes de 50
    let ok = 0
    let err = 0
    const loteSize = 50

    for (let i = 0; i < preview.length; i += loteSize) {
      const lote = preview.slice(i, i + loteSize)
      const { error: insertErr } = await supabase.from('productos').insert(lote)
      if (insertErr) {
        err += lote.length
      } else {
        ok += lote.length
      }
    }

    setResultado({ ok, err })
    if (ok > 0) {
      setPreview([])
      setTexto('')
    }
    setImportando(false)
  }

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-4xl tracking-wider mb-2">IMPORTAR PRODUCTOS</h1>
      <p className="text-gray-500 mb-8">
        Pega datos copiados de Excel. Formato esperado (columnas separadas por Tab):<br />
        <code className="text-xs bg-gray-100 px-2 py-1 mt-1 inline-block">MARCA → CÓDIGO → NOMBRE → ORIGEN → PRECIO</code>
      </p>

      {/* Textarea */}
      <div className="card p-6 mb-4">
        <label className="text-sm font-semibold block mb-2">Datos a importar</label>
        <textarea
          value={texto}
          onChange={e => { setTexto(e.target.value); setPreview([]); setResultado(null) }}
          placeholder={'GOODYEAR\t110886\t275/45R21 EAG F1 ASY SUV 110W XL FP\tCHINA\t$9,963.24\nGOODYEAR\t110887\t205/55R16 EFFICIENTGRIP 91V\tMEXICO\t$3,450.00'}
          rows={8}
          className="w-full border border-gray-200 px-4 py-3 text-sm font-mono focus:outline-none focus:border-brand-black resize-y"
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={parsear}
            disabled={!texto.trim()}
            className="btn-primary text-sm py-2 px-6 disabled:opacity-50"
          >
            Parsear
          </button>
          {preview.length > 0 && (
            <button
              onClick={importar}
              disabled={importando}
              className="bg-green-600 text-white font-display tracking-wider text-sm px-6 py-2 hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {importando ? 'IMPORTANDO...' : `IMPORTAR TODO (${preview.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Errores de parseo */}
      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-4">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Resultado de importación */}
      {resultado && (
        <div className={`flex items-start gap-2 px-4 py-3 text-sm mb-4 border ${resultado.err === 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
          <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>
            {resultado.ok} producto{resultado.ok !== 1 ? 's' : ''} importado{resultado.ok !== 1 ? 's' : ''} correctamente.
            {resultado.err > 0 && ` ${resultado.err} con error.`}
          </span>
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between">
            <p className="font-semibold text-sm">{preview.length} productos detectados</p>
            <p className="text-xs text-gray-400">Revisa antes de importar</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-4 py-2 font-semibold text-gray-600">#</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-600">Marca</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-2 font-semibold text-gray-600">Medida</th>
                  <th className="text-right px-4 py-2 font-semibold text-gray-600">Precio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {preview.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-2 text-xs text-gray-500">{p.marca}</td>
                    <td className="px-4 py-2 font-medium max-w-xs truncate">{p.nombre}</td>
                    <td className="px-4 py-2">
                      {p.medida
                        ? <span className="badge-yellow text-xs">{p.medida}</span>
                        : <span className="text-xs text-orange-500">Sin medida</span>
                      }
                    </td>
                    <td className="px-4 py-2 text-right font-display tracking-wider">
                      ${p.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
