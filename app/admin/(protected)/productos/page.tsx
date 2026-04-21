import { createServerClient } from '@/lib/supabase-server'
import ProductosAdmin from '@/components/admin/ProductosAdmin'

export const revalidate = 0

export default async function AdminProductosPage() {
  const supabase = await createServerClient()
  const { data: productos } = await supabase
    .from('productos')
    .select('*')
    .order('categoria')
    .order('nombre')

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wider mb-8">PRODUCTOS</h1>
      <ProductosAdmin productos={productos ?? []} />
    </div>
  )
}
