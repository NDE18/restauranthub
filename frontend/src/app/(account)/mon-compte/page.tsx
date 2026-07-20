import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, ShoppingBag, CalendarDays, Star } from 'lucide-react'
import Link from 'next/link'
import { TIER_LABELS, TIER_COLORS } from '@/lib/utils'

export default async function AccountDashboardPage() {
  const session = await getServerSession(authOptions)

  const stats = [
    { label: 'Commandes', value: '12', icon: ShoppingBag, href: '/mon-compte/commandes' },
    { label: 'Réservations', value: '5', icon: CalendarDays, href: '/mon-compte/reservations' },
    { label: 'Points fidélité', value: '340', icon: Star, href: '/mon-compte/fidelite' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mon compte</h1>
        <p className="text-gray-500">Bonjour, {session?.user?.name} 👋</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <Link key={s.label} href={s.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{s.value}</p>
                      <p className="text-sm text-gray-500">{s.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Profil rapide */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Informations personnelles</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Nom</span>
            <span className="font-medium">{session?.user?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Email</span>
            <span className="font-medium">{session?.user?.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-500 text-sm">Statut fidélité</span>
            <Badge className="bg-amber-100 text-amber-700">BRONZE</Badge>
          </div>
          <div className="pt-2">
            <Link href="/mon-compte/profil" className="text-sm text-orange-500 hover:underline">
              Modifier mes informations →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
