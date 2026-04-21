import { createServerClient } from '@/lib/supabase-server'
import InventarioAdmin from '@/components/admin/InventarioAdmin'

export const revalidate = 0

export default async function AdminInventarioPage() {
  const supabase = await createServerClient()
  const { data: productos } = await supabase
    .from('productos')
    .select('id, nombre, medida, categoria, stock, activo')
    .eq('activo', true)
    .order('stock')

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wider mb-2">INVENTARIO</h1>
      <p className="text-gray-500 mb-8">Ajusta rápidamente el stock de tus productos.</p>
      <InventarioAdmin productos={productos ?? []} />
    </div>
  )
}
