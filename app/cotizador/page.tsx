import { createServerClient } from '@/lib/supabase-server'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CotizadorForm from '@/components/quote/CotizadorForm'
import type { Producto } from '@/types'

export default async function CotizadorPage() {
  const supabase = await createServerClient()
  const { data: productos } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .eq('categoria', 'llanta')
    .gt('stock', 0)
    .order('precio')

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10">
          <span className="badge-yellow mb-3 inline-block">COTIZADOR</span>
          <h1 className="section-title mb-2">COTIZA TUS LLANTAS</h1>
          <p className="text-gray-500">Llena el formulario y te enviamos tu cotización personalizada.</p>
        </div>

        <CotizadorForm productos={(productos as Producto[]) ?? []} />
      </main>
      <Footer />
    </>
  )
}
