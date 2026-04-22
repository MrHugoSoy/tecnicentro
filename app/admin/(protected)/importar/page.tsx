'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, AlertCircle, Trash2 } from 'lucide-react'

type ProductoParsed = {
  marca: string
  codigo: string | null
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

  // Formato 5 cols: MARCA | CODIGO | NOMBRE | ORIGEN | PRECIO
  // Formato 4 cols: MARCA | CODIGO | NOMBRE | PRECIO
  if (cols.length < 4) return null

  const marca = cols[0]
  const codigo = cols[1] || null
  const nombre = cols[2]

  // Detectar si col[3] es el precio (formato 4 cols) o el origen (formato 5 cols)
  const esPrecioEnCol3 = cols.length === 4 || /[$\d]/.test(cols[3])
  const precio = parsearPrecio(esPrecioEnCol3 ? cols[3] : cols[4] ?? '')

  if (!marca || !nombre || precio <= 0) return null

  return {
    marca,
    codigo,
    nombre,       // solo col[2], nunca incluye origen
    medida: extraerMedida(nombre),
    origen: null, // cols[3] se ignora siempre
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

  // Estado modal borrar inventario
  const [modalBorrar, setModalBorrar] = useState(false)
  const [passConfirm, setPassConfirm] = useState('')
  const [borrando, setBorrando] = useState(false)
  const [errorBorrar, setErrorBorrar] = useState('')
  const [borradoOk, setBorradoOk] = useState(false)

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

    let ok = 0
    let err = 0
    const loteSize = 50

    for (let i = 0; i < preview.length; i += loteSize) {
      const lote = preview.slice(i, i + loteSize)
      const { error: insertErr } = await supabase.from('productos').insert(lote)
      if (insertErr) err += lote.length
      else ok += lote.length
    }

    setResultado({ ok, err })
    if (ok > 0) { setPreview([]); setTexto('') }
    setImportando(false)
  }

  const confirmarBorrado = async () => {
    if (!passConfirm) return
    setBorrando(true)
    setErrorBorrar('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) {
      setErrorBorrar('No se pudo obtener la sesión.')
      setBorrando(false)
      return
    }

    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: passConfirm,
    })

    if (authErr) {
      setErrorBorrar('Contraseña incorrecta.')
      setBorrando(false)
      return
    }

    const { error: delErr } = await supabase.from('productos').delete().neq('id', 0)

    if (delErr) {
      setErrorBorrar('Error al borrar: ' + delErr.message)
    } else {
      setBorradoOk(true)
      setModalBorrar(false)
    }
    setPassConfirm('')
    setBorrando(false)
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

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-4">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {resultado && (
        <div className={`flex items-start gap-2 px-4 py-3 text-sm mb-4 border ${resultado.err === 0 ? 'bg-green-50 border-green-200 text-green-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
          <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>
            {resultado.ok} producto{resultado.ok !== 1 ? 's' : ''} importado{resultado.ok !== 1 ? 's' : ''} correctamente.
            {resultado.err > 0 && ` ${resultado.err} con error.`}
          </span>
        </div>
      )}

      {borradoOk && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm mb-4">
          <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
          Inventario borrado correctamente.
        </div>
      )}

      {/* Preview */}
      {preview.length > 0 && (
        <div className="card overflow-hidden mb-8">
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
                  <th className="text-left px-4 py-2 font-semibold text-gray-600">Código</th>
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
                    <td className="px-4 py-2 text-xs text-gray-400">{p.codigo ?? '—'}</td>
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

      {/* Zona peligrosa */}
      <div className="border border-red-200 p-6 mt-8">
        <h2 className="font-display tracking-wider text-red-600 mb-1">ZONA PELIGROSA</h2>
        <p className="text-sm text-gray-500 mb-4">Esta acción elimina todos los productos del catálogo de forma permanente.</p>
        <button
          onClick={() => { setModalBorrar(true); setErrorBorrar(''); setPassConfirm(''); setBorradoOk(false) }}
          className="flex items-center gap-2 bg-red-600 text-white text-sm font-semibold px-4 py-2 hover:bg-red-700 transition-colors"
        >
          <Trash2 size={15} /> Borrar todo el inventario
        </button>
      </div>

      {/* Modal confirmación */}
      {modalBorrar && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm p-6">
            <h3 className="font-display text-xl tracking-wider text-red-600 mb-2">CONFIRMAR BORRADO</h3>
            <p className="text-sm text-gray-600 mb-4">
              Se eliminarán <strong>todos los productos</strong> permanentemente. Ingresa tu contraseña para continuar.
            </p>
            <input
              type="password"
              className="input-field mb-3"
              placeholder="Tu contraseña"
              value={passConfirm}
              onChange={e => { setPassConfirm(e.target.value); setErrorBorrar('') }}
              autoFocus
            />
            {errorBorrar && (
              <p className="text-xs text-red-600 mb-3 flex items-center gap-1">
                <AlertCircle size={13} /> {errorBorrar}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setModalBorrar(false)}
                className="flex-1 border border-gray-300 text-sm py-2 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarBorrado}
                disabled={!passConfirm || borrando}
                className="flex-1 bg-red-600 text-white text-sm py-2 hover:bg-red-700 disabled:opacity-50 transition-colors font-semibold"
              >
                {borrando ? 'Verificando...' : 'Borrar todo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
