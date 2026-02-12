import React from "react"
import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from "@/contexts/auth-context"
import { FavoritesProvider } from "@/contexts/favorites-context"
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AdamSoul - Премиальная мужская одежда',
  description: 'Интернет-магазин премиальной мужской одежды AdamSoul. Классические костюмы, рубашки, пальто и casual коллекция.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className={montserrat.variable}>
      <body className="font-sans antialiased overflow-x-hidden">
        <AuthProvider>
          <FavoritesProvider>
            {children}
          </FavoritesProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
