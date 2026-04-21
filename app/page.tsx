import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowRight, CheckCircle, Star, Wrench, Calendar, Calculator } from 'lucide-react'
import { createServerClient } from '@/lib/supabase-server'
import type { Producto } from '@/types'

const serviciosDestacados = [
  {
    icon: Calculator,
    title: 'Cotizador en Línea',
    desc: 'Obtén un precio estimado de llantas para tu vehículo en segundos.',
    href: '/cotizador',
    cta: 'Cotizar ahora',
  },
  {
    icon: Calendar,
    title: 'Agenda tu Cita',
    desc: 'Reserva un horario y llega sin esperar. Atención puntual garantizada.',
    href: '/citas',
    cta: 'Agendar cita',
  },
  {
    icon: Wrench,
    title: 'Catálogo de Llantas',
    desc: 'Explora toda nuestra línea Goodyear y encuentra la llanta ideal.',
    href: '/catalogo',
    cta: 'Ver catálogo',
  },
]

const beneficios = [
  'Distribuidor autorizado Goodyear',
  'Alineación y balanceo computarizado',
  'Suspensión, amortiguadores y frenos',
  'Instalación profesional en el momento',
  'Garantía de fábrica en todos los productos',
  'Paseo Solidaridad #9225 — Salida a Salamanca',
]

export default async function HomePage() {
  const supabase = await createServerClient()
  const { data: productos } = await supabase
    .from('productos')
    .select('id, nombre, medida, precio, imagen_url')
    .eq('activo', true)
    .order('nombre')
    .limit(8)

  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative bg-brand-black text-white overflow-hidden hero-stripe min-h-[520px] flex items-center">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #FFD700 0, #FFD700 1px, transparent 0, transparent 50%)',
            backgroundSize: '20px 20px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="badge-yellow mb-4 inline-block">Paseo Solidaridad #9225, Irapuato, Gto.</span>
            <h1 className="font-display text-6xl md:text-7xl tracking-wider leading-none mb-6">
              LAS LLANTAS<br />
              <span className="text-brand-yellow">QUE TU AUTO</span><br />
              NECESITA
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-md leading-relaxed">
              Distribuidor autorizado Goodyear en Irapuato. Alineación, balanceo, frenos, suspensión y más. Cotización instantánea y citas sin esperas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/cotizador" className="btn-primary text-center">
                Cotizar Llantas
              </Link>
              <Link href="/catalogo" className="btn-outline border-white text-white hover:bg-white hover:text-brand-black text-center">
                Ver Catálogo
              </Link>
            </div>
          </div>

          {/* Decorative element */}
          <div className="hidden md:flex justify-center items-center">
            <div className="w-64 h-64 rounded-full border-4 border-brand-yellow flex items-center justify-center relative">
              <div className="w-48 h-48 rounded-full bg-brand-yellow flex items-center justify-center">
                <div className="text-center">
                  <p className="font-display text-5xl text-brand-black tracking-wider">100%</p>
                  <p className="font-display text-sm text-brand-black tracking-widest">TECNICENTRO</p>
                  <p className="font-display text-sm text-brand-black tracking-widest">ORIGINAL</p>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-brand-black border-2 border-brand-yellow rounded-full flex items-center justify-center">
                <Star size={24} className="text-brand-yellow fill-brand-yellow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Servicios rápidos */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="section-title text-center mb-2">¿QUÉ NECESITAS?</h2>
        <p className="text-center text-gray-500 mb-12">Todo lo que necesitas para tus llantas, en un solo lugar.</p>

        <div className="grid md:grid-cols-3 gap-6">
          {serviciosDestacados.map((s) => (
            <div key={s.title} className="card p-8 group hover:-translate-y-1 transition-transform duration-200">
              <div className="w-12 h-12 bg-brand-yellow flex items-center justify-center mb-6">
                <s.icon size={24} className="text-brand-black" />
              </div>
              <h3 className="font-display text-2xl tracking-wider mb-3">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{s.desc}</p>
              <Link
                href={s.href}
                className="flex items-center gap-2 font-display tracking-wider text-sm text-brand-black group-hover:text-yellow-600 transition-colors"
              >
                {s.cta} <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Preview catálogo */}
      {productos && productos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <span className="badge-yellow mb-3 inline-block">CATÁLOGO</span>
            <h2 className="section-title mb-2">NUESTRAS LLANTAS</h2>
            <p className="text-gray-500">Productos originales Goodyear con garantía de fábrica.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {(productos as Pick<Producto, 'id' | 'nombre' | 'medida' | 'precio' | 'imagen_url'>[]).map(p => (
              <Link key={p.id} href="/catalogo" className="card group overflow-hidden hover:-translate-y-1 transition-transform duration-200">
                <div className="bg-gray-100 h-40 flex items-center justify-center overflow-hidden">
                  {p.imagen_url ? (
                    <img
                      src={p.imagen_url}
                      alt={p.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <span className="font-display text-3xl text-gray-300 tracking-widest">
                        {p.nombre.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-semibold text-sm leading-tight mb-1 line-clamp-2">{p.nombre}</p>
                  <p className="text-xs text-gray-400 mb-2">{p.medida}</p>
                  <p className="font-display tracking-wider text-brand-black">
                    ${p.precio.toLocaleString('es-MX')}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/catalogo" className="btn-primary inline-flex items-center gap-2">
              Ver catálogo completo <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

      {/* Beneficios */}
      <section className="bg-brand-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="badge-yellow mb-4 inline-block">¿POR QUÉ ELEGIRNOS?</span>
            <h2 className="font-display text-5xl tracking-wider text-brand-yellow mb-6">
              CALIDAD Y<br />CONFIANZA
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Somos el distribuidor autorizado Goodyear con más experiencia en Irapuato. 
              Combinamos productos originales con el mejor servicio técnico de la región.
            </p>
          </div>
          <ul className="space-y-4">
            {beneficios.map(b => (
              <li key={b} className="flex items-center gap-3">
                <CheckCircle size={20} className="text-brand-yellow flex-shrink-0" />
                <span className="text-gray-300">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="section-title mb-4">¿LISTO PARA ARRANCAR?</h2>
        <p className="text-gray-500 mb-8">Agenda tu cita hoy y te atendemos sin demoras.</p>
        <Link href="/citas" className="btn-primary">
          Agendar Cita Ahora
        </Link>
      </section>

      <Footer />
    </>
  )
}
