import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AccountSidebar from '@/components/layout/AccountSidebar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/connexion?callbackUrl=/mon-compte')

  return (
    <>
      <Navbar />
      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <AccountSidebar />
          </aside>
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
      <Footer />
    </>
  )
}
