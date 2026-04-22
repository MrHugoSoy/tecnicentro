import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

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

export async function POST(req: NextRequest) {
  const { texto } = await req.json()
  if (!texto?.trim()) {
    return NextResponse.json({ error: 'Texto vacío' }, { status: 400 })
  }

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `Eres un parser de inventario de llantas. Recibirás texto con columnas separadas por tabulaciones copiado de Excel.

El formato puede ser:
- 5 columnas: MARCA | CÓDIGO | NOMBRE | ORIGEN | PRECIO
- 4 columnas: MARCA | CÓDIGO | NOMBRE | PRECIO (sin origen)

Para cada fila válida, extrae:
- marca: fabricante (ej: GOODYEAR, MICHELIN, BRIDGESTONE)
- codigo: número de parte/código del producto, puede ser null
- nombre: nombre completo del producto SOLO de la columna nombre, nunca incluyas el origen en el nombre
- medida: medida de la llanta extraída del nombre (ej: 205/55R16, 275/45R21). Usa regex: /\d{2,3}\/\d{2,3}[A-Z]?\d{2,3}[A-Z]*/i. Si no hay medida, usa ""
- origen: país de fabricación si está presente (ej: "MEXICO", "CHINA", "ESTADOS UNIDOS"), null si no aplica. Si el texto dice "MX" pon "MEXICO", si dice "CN" pon "CHINA", si dice "US" pon "ESTADOS UNIDOS"
- precio: número decimal, elimina símbolos $ y comas. Si no hay precio válido, omite la fila

Devuelve ÚNICAMENTE un array JSON válido, sin explicaciones, sin markdown, sin texto extra. Solo el JSON.

Ejemplo de salida:
[{"marca":"GOODYEAR","codigo":"110886","nombre":"275/45R21 EAG F1 ASY SUV 110W XL FP","medida":"275/45R21","origen":"CHINA","precio":9963.24,"categoria":"llanta","precio_instalacion":0,"stock":0,"activo":true,"imagen_url":null}]

Texto a parsear:
${texto}`,
      },
    ],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

  let productos: ProductoParsed[] = []
  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('No JSON array found')
    const parsed = JSON.parse(jsonMatch[0])
    productos = parsed.filter(
      (p: ProductoParsed) => p.marca && p.nombre && p.precio > 0
    ).map((p: ProductoParsed) => ({
      ...p,
      categoria: p.categoria ?? 'llanta',
      precio_instalacion: p.precio_instalacion ?? 0,
      stock: p.stock ?? 0,
      activo: p.activo ?? true,
      imagen_url: null,
    }))
  } catch {
    return NextResponse.json({ error: 'Error al parsear respuesta de IA', raw }, { status: 500 })
  }

  return NextResponse.json({ productos })
}
