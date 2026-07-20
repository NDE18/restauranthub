'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Store,
  CalendarDays,
  ShoppingBag,
  Truck,
  Users,
  Gift,
  BarChart3,
  Settings,
} from 'lucide-react'

const nav = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/restaurants', label: 'Restaurants', icon: Store },
  { href: '/admin/reservations', label: 'Réservations', icon: CalendarDays },
  { href: '/admin/commandes', label: 'Commandes', icon: ShoppingBag },
  { href: '/admin/livraisons', label: 'Livraisons', icon: Truck },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/fidelite', label: 'Fidélité', icon: Gift },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0 border-r bg-gray-50 min-h-screen">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">🍽️</span>
          <span className="font-bold">Saveurs Admin</span>
        </Link>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
