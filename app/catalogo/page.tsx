import { createServerClient } from '@/lib/supabase-server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CatalogoGrid from '@/components/catalog/CatalogoGrid'
import type { Producto } from '@/types'

export const revalidate = 60

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; medida?: string; q?: string }>
}) {
  const { categoria, medida, q } = await searchParams
  const supabase = await createServerClient()

  let query = supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('nombre')

  if (categoria) {
    query = query.eq('categoria', categoria)
  }
  if (medida) {
    query = query.ilike('medida', `%${medida}%`)
  }
  if (q) {
    query = query.ilike('nombre', `%${q}%`)
  }

  const { data: productos } = await query

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-10">
          <span className="badge-yellow mb-3 inline-block">CATÁLOGO</span>
          <h1 className="section-title mb-2">NUESTRAS LLANTAS</h1>
          <p className="text-gray-500">Productos originales Goodyear con garantía de fábrica.</p>
        </div>

        <CatalogoGrid productos={(productos as Producto[]) ?? []} />
      </main>
      <Footer />
    </>
  )
}
