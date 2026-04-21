'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Phone } from 'lucide-react'

const links = [
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/cotizador', label: 'Cotizador' },
  { href: '/citas', label: 'Agendar Cita' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-brand-black text-white sticky top-0 z-50">
      {/* Top strip */}
      <div className="bg-brand-yellow text-brand-black text-xs font-body font-semibold text-center py-1 tracking-wide">
        📞 462 627 65 33 &nbsp;|&nbsp; 462 627 65 34 &nbsp;|&nbsp; ✉ tecnisolidaridad@hotmail.com &nbsp;|&nbsp; Lun–Sáb 8am–7pm
      </div>

      <nav className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="font-display text-2xl tracking-widest text-brand-yellow hover:opacity-80 transition-opacity">
          TECNICENTRO
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="font-display tracking-wider text-base text-gray-300 hover:text-brand-yellow transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/citas" className="btn-primary text-sm py-2 px-5">
            Agendar Ahora
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="Menú"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-brand-gray border-t border-gray-700 px-4 py-4 flex flex-col gap-4">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-display tracking-wider text-lg text-gray-300 hover:text-brand-yellow transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/citas" className="btn-primary text-center" onClick={() => setOpen(false)}>
            Agendar Cita
          </Link>
        </div>
      )}
    </header>
  )
}
