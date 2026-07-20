'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, Menu, User, LogOut, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/hooks/useCart'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const totalItems = useCart((s) => s.totalItems)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <span className="font-bold text-xl text-gray-900">Saveurs</span>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/restaurants" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Restaurants
          </Link>
          <Link href="/commande" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Commander
          </Link>
          <Link href="/restaurants?service=livraison" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Livraison
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Panier */}
          <Link href="/commande" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {totalItems() > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {totalItems()}
              </Badge>
            )}
          </Link>

          {/* Compte */}
          {session ? (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/mon-compte">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  Mon compte
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden md:flex gap-2">
              <Link href="/auth/connexion">
                <Button variant="outline" size="sm">Connexion</Button>
              </Link>
              <Link href="/auth/inscription">
                <Button size="sm">S'inscrire</Button>
              </Link>
            </div>
          )}

          {/* Burger mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
          <Link href="/restaurants" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Restaurants</Link>
          <Link href="/commande" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Commander</Link>
          <Link href="/restaurants?service=livraison" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Livraison</Link>
          {session ? (
            <>
              <Link href="/mon-compte" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Mon compte</Link>
              <button className="block text-sm font-medium py-2 text-red-600" onClick={() => signOut()}>Déconnexion</button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Link href="/auth/connexion"><Button variant="outline" className="w-full">Connexion</Button></Link>
              <Link href="/auth/inscription"><Button className="w-full">S'inscrire</Button></Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
