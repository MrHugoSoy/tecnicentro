'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Admin } from '@/types'
import {
  LayoutDashboard,
  Package,
  Calendar,
  FileText,
  Warehouse,
  Upload,
  Tag,
  LogOut,
  ExternalLink,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/citas', label: 'Citas', icon: Calendar },
  { href: '/admin/cotizaciones', label: 'Cotizaciones', icon: FileText },
  { href: '/admin/productos', label: 'Productos', icon: Package },
  { href: '/admin/inventario', label: 'Inventario', icon: Warehouse },
  { href: '/admin/importar', label: 'Importar', icon: Upload },
  { href: '/admin/promociones', label: 'Promociones', icon: Tag },
]

export default function AdminSidebar({ admin }: { admin: Admin }) {
  const pathname = usePathname()
  const router = useRouter()

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <aside className="w-60 bg-brand-black text-white flex flex-col min-h-screen flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-800">
        <p className="font-display text-xl tracking-widest text-brand-yellow">TECNICENTRO</p>
        <p className="font-display text-xs text-gray-500 tracking-widest">ADMIN</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 transition-colors font-body text-sm ${
              isActive(item)
                ? 'bg-brand-yellow text-brand-black font-semibold'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}

        <div className="pt-4 border-t border-gray-800 mt-4">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm"
          >
            <ExternalLink size={16} />
            Ver sitio
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 mb-1 truncate">{admin.email}</p>
        <p className="text-xs text-brand-yellow font-semibold uppercase tracking-wider mb-3">{admin.rol}</p>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <LogOut size={14} /> Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
