import type { Metadata } from 'next'
import { Bebas_Neue, DM_Sans } from 'next/font/google'
import './globals.css'

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Tecnicentro | Llantas y Servicios',
  description: 'Tu distribuidor Goodyear en Irapuato, Guanajuato. Catálogo de llantas, cotizaciones y agenda de servicios.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${bebasNeue.variable} ${dmSans.variable}`}>
      <body className="font-body bg-brand-light text-brand-black antialiased">
        {children}
      </body>
    </html>
  )
}
