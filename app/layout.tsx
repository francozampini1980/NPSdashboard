import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Métricas de Experiencia',
  description: 'Dashboard NPS - Post Compra y Post Entrega',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full">
        {children}
      </body>
    </html>
  )
}
