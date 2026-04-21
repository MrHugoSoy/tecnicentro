import Link from 'next/link'
import { Phone, MapPin, Clock, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-brand-black text-gray-400 mt-24">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <p className="font-display text-2xl tracking-widest text-brand-yellow mb-2">
            TECNICENTRO
          </p>
          <p className="text-sm leading-relaxed">
            Distribuidor autorizado Goodyear en Irapuato, Guanajuato. Llantas, rines y servicios de calidad.
          </p>
          <p className="text-xs mt-3 text-gray-500">Tecnicentro Solidaridad</p>
        </div>

        {/* Links */}
        <div>
          <p className="font-display text-white tracking-wider mb-4">NAVEGACIÓN</p>
          <ul className="space-y-2 text-sm">
            {[
              { href: '/catalogo', label: 'Catálogo de Llantas' },
              { href: '/cotizador', label: 'Cotizador' },
              { href: '/citas', label: 'Agendar Cita' },
            ].map(l => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-brand-yellow transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <p className="font-display text-white tracking-wider mb-4">CONTACTO</p>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <Phone size={16} className="mt-0.5 text-brand-yellow flex-shrink-0" />
              <span>462 627 65 33 / 462 627 65 34</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail size={16} className="mt-0.5 text-brand-yellow flex-shrink-0" />
              <a href="mailto:tecnisolidaridad@hotmail.com" className="hover:text-brand-yellow transition-colors">
                tecnisolidaridad@hotmail.com
              </a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 text-brand-yellow flex-shrink-0" />
              <span>Paseo Solidaridad #9225, Irapuato, Gto.<br />(Salida a Salamanca)</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 text-brand-yellow flex-shrink-0" />
              <span>Lunes a Sábado: 8:00am – 7:00pm</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 text-center py-4 text-xs">
        © {new Date().getFullYear()} Tecnicentro. Todos los derechos reservados.
      </div>
    </footer>
  )
}
