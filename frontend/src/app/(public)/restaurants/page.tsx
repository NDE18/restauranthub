import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Star, Clock, Search, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Nos restaurants' }

const MOCK_RESTAURANTS = [
  { id: 'r1', name: 'Le Bœuf Couronné', cuisine: 'Brasserie', city: 'Paris 8e', rating: '4.8', deliveryTime: '25-35 min', emoji: '🥩', services: ['Réservation', 'Click & Collect', 'Livraison'], tags: ['Viande', 'Gastronomique'] },
  { id: 'r2', name: 'Sakura Garden', cuisine: 'Japonais', city: 'Paris 6e', rating: '4.9', deliveryTime: '30-45 min', emoji: '🍜', services: ['Réservation', 'Click & Collect'], tags: ['Sushi', 'Ramen'] },
  { id: 'r3', name: 'La Trattoria', cuisine: 'Italien', city: 'Paris 11e', rating: '4.7', deliveryTime: '20-30 min', emoji: '🍕', services: ['Réservation', 'Livraison'], tags: ['Pizza', 'Pâtes'] },
  { id: 'r4', name: 'Le Jardin Fleuri', cuisine: 'Végétarien', city: 'Paris 9e', rating: '4.6', deliveryTime: '20-25 min', emoji: '🥗', services: ['Click & Collect', 'Livraison'], tags: ['Vegan', 'Bio'] },
  { id: 'r5', name: 'Maison Curry', cuisine: 'Indien', city: 'Paris 10e', rating: '4.5', deliveryTime: '30-40 min', emoji: '🍛', services: ['Livraison'], tags: ['Curry', 'Épicé'] },
  { id: 'r6', name: 'Le Comptoir Français', cuisine: 'Bistrot', city: 'Paris 3e', rating: '4.7', deliveryTime: '25-30 min', emoji: '🥐', services: ['Réservation', 'Click & Collect'], tags: ['Traditionnel', 'Brunch'] },
]

export default function RestaurantsPage() {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Nos restaurants</h1>
        <p className="text-gray-500">Découvrez {MOCK_RESTAURANTS.length} établissements partenaires</p>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Rechercher un restaurant, une cuisine..." className="pl-9" />
        </div>
        <Select>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Cuisine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les cuisines</SelectItem>
            <SelectItem value="francais">Français</SelectItem>
            <SelectItem value="japonais">Japonais</SelectItem>
            <SelectItem value="italien">Italien</SelectItem>
            <SelectItem value="indien">Indien</SelectItem>
            <SelectItem value="vegetarien">Végétarien</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les services</SelectItem>
            <SelectItem value="reservation">Réservation</SelectItem>
            <SelectItem value="click-collect">Click & Collect</SelectItem>
            <SelectItem value="livraison">Livraison</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2 shrink-0">
          <SlidersHorizontal className="h-4 w-4" />
          Filtres
        </Button>
      </div>

      {/* Grille */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_RESTAURANTS.map((r) => (
          <Link key={r.id} href={`/restaurants/${r.id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer h-full">
              <div className="h-48 bg-gradient-to-br from-orange-100 to-amber-100 relative flex items-center justify-center">
                <span className="text-7xl">{r.emoji}</span>
                <Badge className="absolute top-3 left-3 bg-white text-gray-800 shadow-sm">
                  {r.cuisine}
                </Badge>
              </div>
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg group-hover:text-orange-500 transition-colors">{r.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{r.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{r.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />{r.deliveryTime}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {r.services.map((s) => (
                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
