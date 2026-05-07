import type { Metadata } from 'next'
import { Work_Sans, Roboto } from 'next/font/google'
import './globals.css'

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
  display: 'swap',
})

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  weight: ['400', '500', '700'],
  display: 'swap',
})

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
    <html lang="es" className={`${workSans.variable} ${roboto.variable} h-full`}>
      <body className="min-h-full">
        {children}
      </body>
    </html>
  )
}
