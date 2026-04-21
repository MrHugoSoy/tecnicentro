import { createServerClient } from '@/lib/supabase-server'
import CotizacionesTable from '@/components/admin/CotizacionesTable'

export const revalidate = 0

export default async function AdminCotizacionesPage() {
  const supabase = await createServerClient()
  const { data: cotizaciones } = await supabase
    .from('cotizaciones')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wider mb-8">COTIZACIONES</h1>
      <CotizacionesTable cotizaciones={cotizaciones ?? []} />
    </div>
  )
}
