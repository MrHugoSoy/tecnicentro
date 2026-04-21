import { createServerClient } from '@/lib/supabase-server'
import CitasTable from '@/components/admin/CitasTable'

export const revalidate = 0

export default async function AdminCitasPage() {
  const supabase = await createServerClient()
  const { data: citas } = await supabase
    .from('citas')
    .select('*, servicios(nombre)')
    .order('fecha', { ascending: false })
    .order('hora', { ascending: true })

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wider mb-8">CITAS</h1>
      <CitasTable citas={citas ?? []} />
    </div>
  )
}
