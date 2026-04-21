import { createServerClient } from '@/lib/supabase-server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import AgendarForm from '@/components/booking/AgendarForm'
import type { Servicio } from '@/types'

export default async function CitasPage() {
  const supabase = await createServerClient()
  const { data: servicios } = await supabase
    .from('servicios')
    .select('*')
    .eq('activo', true)
    .order('nombre')

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-10">
          <span className="badge-yellow mb-3 inline-block">AGENDA</span>
          <h1 className="section-title mb-2">AGENDA TU CITA</h1>
          <p className="text-gray-500">Reserva tu lugar y llega sin esperas. Te confirmamos por teléfono.</p>
        </div>

        <AgendarForm servicios={(servicios as Servicio[]) ?? []} />
      </main>
      <Footer />
    </>
  )
}
