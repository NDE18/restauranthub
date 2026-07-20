import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AdminSidebar from '@/components/layout/AdminSidebar'
import Navbar from '@/components/layout/Navbar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/connexion?callbackUrl=/admin')

  const roles: string[] = (session as any)?.roles ?? []
  if (!roles.includes('ROLE_SUPER_ADMIN') && !roles.includes('ROLE_MANAGER')) {
    redirect('/')
  }

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen">
        <aside className="hidden lg:block w-64 border-r bg-gray-50 shrink-0">
          <AdminSidebar />
        </aside>
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </>
  )
}
