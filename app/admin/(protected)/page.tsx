import { createServerClient } from '@/lib/supabase-server'
import { Calendar, FileText, Package, AlertTriangle } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createServerClient()

  const [
    { count: citasPendientes },
    { count: cotizacionesNuevas },
    { count: totalProductos },
    { data: stockBajo },
    { data: citasHoy },
  ] = await Promise.all([
    supabase.from('citas').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
    supabase.from('cotizaciones').select('*', { count: 'exact', head: true }).eq('estado', 'nueva'),
    supabase.from('productos').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('productos').select('nombre, medida, stock').eq('activo', true).lte('stock', 3).order('stock'),
    supabase.from('citas')
      .select('*, servicios(nombre)')
      .eq('fecha', new Date().toISOString().split('T')[0])
      .order('hora'),
  ])

  const stats = [
    { label: 'Citas pendientes', value: citasPendientes ?? 0, icon: Calendar, href: '/admin/citas', color: 'bg-blue-50 text-blue-600' },
    { label: 'Cotizaciones nuevas', value: cotizacionesNuevas ?? 0, icon: FileText, href: '/admin/cotizaciones', color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Productos activos', value: totalProductos ?? 0, icon: Package, href: '/admin/productos', color: 'bg-green-50 text-green-600' },
    { label: 'Stock bajo (≤3)', value: stockBajo?.length ?? 0, icon: AlertTriangle, href: '/admin/inventario', color: 'bg-red-50 text-red-600' },
  ]

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wider mb-8">DASHBOARD</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <a key={s.label} href={s.href} className="card p-5 hover:-translate-y-0.5 transition-transform">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon size={20} />
            </div>
            <p className="font-display text-3xl tracking-wider">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </a>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Citas de hoy */}
        <div className="card p-6">
          <h2 className="font-display text-xl tracking-wider mb-4">
            CITAS HOY — {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h2>
          {!citasHoy || citasHoy.length === 0 ? (
            <p className="text-gray-400 text-sm py-4">No hay citas programadas para hoy.</p>
          ) : (
            <div className="space-y-3">
              {citasHoy.map((c: any) => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                  <span className="font-display text-lg tracking-wider text-brand-black w-14 flex-shrink-0">{c.hora.slice(0, 5)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{c.nombre_cliente}</p>
                    <p className="text-xs text-gray-500 truncate">{c.vehiculo} {c.servicios?.nombre ? `— ${c.servicios.nombre}` : ''}</p>
                  </div>
                  <span className={`badge text-xs ${
                    c.estado === 'confirmada' ? 'bg-green-100 text-green-700' :
                    c.estado === 'completada' ? 'bg-gray-100 text-gray-600' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>{c.estado}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock bajo */}
        <div className="card p-6">
          <h2 className="font-display text-xl tracking-wider mb-4">STOCK BAJO</h2>
          {!stockBajo || stockBajo.length === 0 ? (
            <p className="text-gray-400 text-sm py-4">✅ Todo el inventario está bien surtido.</p>
          ) : (
            <div className="space-y-3">
              {stockBajo.map((p: any) => (
                <div key={p.nombre} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-semibold text-sm">{p.nombre}</p>
                    <p className="text-xs text-gray-500">{p.medida}</p>
                  </div>
                  <span className={`font-display text-lg tracking-wider ${p.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>
                    {p.stock} pzas
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
