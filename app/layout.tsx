import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'

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
      <body className="min-h-full flex">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen bg-[#F8FAFC]">
          {children}
        </main>
      </body>
    </html>
  )
}
