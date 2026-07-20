'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CalendarDays,
  ShoppingBag,
  Gift,
  User,
  FileText,
} from 'lucide-react'

const nav = [
  { href: '/mon-compte', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/mon-compte/reservations', label: 'Réservations', icon: CalendarDays },
  { href: '/mon-compte/commandes', label: 'Commandes', icon: ShoppingBag },
  { href: '/mon-compte/fidelite', label: 'Fidélité', icon: Gift },
  { href: '/mon-compte/profil', label: 'Mon profil', icon: User },
  { href: '/mon-compte/donnees', label: 'Mes données', icon: FileText },
]

export function AccountSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 shrink-0">
      <nav className="flex flex-col gap-1">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === href
                ? 'bg-primary text-primary-foreground'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
