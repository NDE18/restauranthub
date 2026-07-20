import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MapPin, Phone, Star, Clock, CalendarDays, ShoppingBag, Truck, Info } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return { title: `Restaurant` }
}

export default function RestaurantDetailPage({ params }: { params: { id: string } }) {
  const restaurant = MOCK_RESTAURANT

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="h-64 w-full md:w-80 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center shrink-0">
          <span className="text-8xl">{restaurant.emoji}</span>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{restaurant.name}</h1>
              <Badge>{restaurant.cuisine}</Badge>
            </div>
            <p className="text-gray-500 text-lg">{restaurant.description}</p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-orange-500" />{restaurant.address}</span>
            <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-orange-500" />{restaurant.phone}</span>
            <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />{restaurant.rating} ({restaurant.reviewCount} avis)</span>
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-orange-500" />{restaurant.hours}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {restaurant.tags.map((t) => (
              <Badge key={t} variant="secondary">{t}</Badge>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href={`/restaurants/${params.id}/reserver`}>
              <Button className="gap-2 bg-orange-500 hover:bg-orange-600">
                <CalendarDays className="h-4 w-4" />
                Réserver une table
              </Button>
            </Link>
            <Link href={`/restaurants/${params.id}/menu`}>
              <Button variant="outline" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                Commander / Emporter
              </Button>
            </Link>
            <Link href={`/restaurants/${params.id}/menu?type=livraison`}>
              <Button variant="outline" className="gap-2">
                <Truck className="h-4 w-4" />
                Livraison
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Separator />

      {/* Horaires */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Horaires d'ouverture
          </h2>
          <div className="space-y-2">
            {restaurant.schedule.map(({ day, hours }) => (
              <div key={day} className="flex justify-between text-sm">
                <span className="font-medium text-gray-700">{day}</span>
                <span className="text-gray-500">{hours}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-orange-500" />
            Informations
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p><strong>Capacité :</strong> {restaurant.capacity} couverts</p>
            <p><strong>Cuisine :</strong> {restaurant.cuisine}</p>
            <p><strong>Livraison :</strong> Gratuite à partir de 25€</p>
            <p><strong>Paiement :</strong> CB, espèces, chèques-vacances</p>
            <p><strong>Accessibilité :</strong> Accès handicapés</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const MOCK_RESTAURANT = {
  id: 'r1',
  name: 'Le Bœuf Couronné',
  cuisine: 'Brasserie',
  description: 'Une brasserie parisienne traditionnelle dans le cœur du 8e arrondissement. Spécialiste des viandes maturées et des grands classiques de la cuisine française.',
  address: '42 avenue des Champs-Élysées, Paris 8e',
  phone: '01 42 00 00 00',
  rating: '4.8',
  reviewCount: 1247,
  hours: 'Ouvert aujourd\'hui 12h – 23h',
  emoji: '🥩',
  capacity: 80,
  tags: ['Viande', 'Gastronomique', 'Terrasse', 'Cave à vins', 'Privatisation'],
  schedule: [
    { day: 'Lundi', hours: '12h00 – 23h00' },
    { day: 'Mardi', hours: '12h00 – 23h00' },
    { day: 'Mercredi', hours: '12h00 – 23h00' },
    { day: 'Jeudi', hours: '12h00 – 23h00' },
    { day: 'Vendredi', hours: '12h00 – 00h00' },
    { day: 'Samedi', hours: '12h00 – 00h00' },
    { day: 'Dimanche', hours: 'Fermé' },
  ],
}
