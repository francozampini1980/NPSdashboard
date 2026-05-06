import { AuthProvider } from '@/lib/auth-context'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-screen bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </AuthProvider>
  )
}
