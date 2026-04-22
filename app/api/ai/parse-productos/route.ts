import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

const SYSTEM_PROMPT = `Eres un parser de inventario de llantas. El usuario te enviará filas con columnas separadas por tabulaciones copiadas de Excel.

Formatos posibles:
- 5 columnas: MARCA | CÓDIGO | NOMBRE | ORIGEN | PRECIO
- 4 columnas: MARCA | CÓDIGO | NOMBRE | PRECIO (sin origen)

Reglas de extracción:
- marca: nombre del fabricante en mayúsculas (GOODYEAR, MICHELIN, BRIDGESTONE, etc.)
- codigo: número de parte. null si no existe
- nombre: SOLO el contenido de la columna nombre. Nunca incluyas el origen en el nombre
- medida: extraída del nombre usando patrón \\d{2,3}/\\d{2,3}[A-Z]?\\d{2,3}[A-Z]*. Cadena vacía si no hay
- origen: país de fabricación normalizado. Ejemplos: "MX"→"MEXICO", "CN"→"CHINA", "US"→"ESTADOS UNIDOS". null si no hay
- precio: número decimal, sin $ ni comas. Omite la fila si precio <= 0
- categoria: siempre "llanta"
- precio_instalacion: 0
- stock: 0
- activo: true
- imagen_url: null

Responde ÚNICAMENTE con un array JSON válido, sin texto antes ni después, sin markdown, sin explicaciones.`

export async function POST(req: NextRequest) {
  console.log('API Key exists:', !!process.env.ANTHROPIC_API_KEY)

  const { texto } = await req.json()
  if (!texto?.trim()) {
    return NextResponse.json({ error: 'Texto vacío' }, { status: 400 })
  }

  let raw = ''
  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: texto,
        },
      ],
    })

    raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Anthropic API error:', msg)
    return NextResponse.json({ error: `Error al llamar a Claude: ${msg}` }, { status: 500 })
  }

  try {
    // Extrae el array aunque haya texto residual
    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error(`La IA no devolvió JSON. Recibido: ${raw.slice(0, 200)}`)
    const parsed = JSON.parse(jsonMatch[0])
    const productos: ProductoParsed[] = parsed
      .filter((p: ProductoParsed) => p.marca && p.nombre && p.precio > 0)
      .map((p: ProductoParsed) => ({
        ...p,
        categoria: p.categoria ?? 'llanta',
        precio_instalacion: p.precio_instalacion ?? 0,
        stock: p.stock ?? 0,
        activo: p.activo ?? true,
        imagen_url: null,
      }))
    return NextResponse.json({ productos })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('JSON parse error:', msg, '\nRaw:', raw)
    return NextResponse.json({ error: `Error al interpretar respuesta: ${msg}`, raw }, { status: 500 })
  }
}
