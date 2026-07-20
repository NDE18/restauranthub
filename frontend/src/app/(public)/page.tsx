import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Star, ShoppingBag, Truck, CalendarDays, Gift } from 'lucide-react'

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-orange-50 py-24">
        <div className="container text-center space-y-6">
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            🎉 Nouveau : livraison en 30 minutes
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            La meilleure table,<br />
            <span className="text-orange-500">à portée de clic</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Réservez votre table, commandez à emporter ou faites-vous livrer dans les meilleurs restaurants de votre ville.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/restaurants">
              <Button size="lg" className="gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8">
                <MapPin className="h-5 w-5" />
                Trouver un restaurant
              </Button>
            </Link>
            <Link href="/commande">
              <Button size="lg" variant="outline" className="gap-2 px-8">
                <ShoppingBag className="h-5 w-5" />
                Commander maintenant
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Nos services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <CalendarDays className="h-8 w-8 text-orange-500" />,
                title: 'Réservation de table',
                desc: 'Réservez en quelques secondes, 24h/24. Confirmation immédiate, rappel automatique.',
                href: '/restaurants',
                cta: 'Réserver une table',
              },
              {
                icon: <ShoppingBag className="h-8 w-8 text-orange-500" />,
                title: 'Click & Collect',
                desc: 'Commandez en ligne, récupérez votre repas sans attendre. Prêt en 20 minutes.',
                href: '/commande',
                cta: 'Commander',
              },
              {
                icon: <Truck className="h-8 w-8 text-orange-500" />,
                title: 'Livraison à domicile',
                desc: 'Vos plats préférés livrés chez vous. Suivi en temps réel de votre commande.',
                href: '/restaurants?service=livraison',
                cta: 'Se faire livrer',
              },
            ].map(({ icon, title, desc, href, cta }) => (
              <Card key={title} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="flex justify-center">{icon}</div>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="text-gray-500 text-sm">{desc}</p>
                  <Link href={href}>
                    <Button variant="outline" size="sm">{cta}</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants en vedette */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Restaurants populaires</h2>
            <Link href="/restaurants">
              <Button variant="ghost" className="text-orange-500 hover:text-orange-600">
                Voir tous →
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_RESTAURANTS.map((r) => (
              <Link key={r.id} href={`/restaurants/${r.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all group cursor-pointer">
                  <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 relative flex items-center justify-center">
                    <span className="text-6xl">{r.emoji}</span>
                    <Badge className="absolute top-3 left-3 bg-white text-gray-800">
                      {r.cuisine}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold group-hover:text-orange-500 transition-colors">{r.name}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {r.city}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{r.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      <span>{r.deliveryTime}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Programme fidélité */}
      <section className="py-20 bg-orange-500 text-white">
        <div className="container text-center space-y-6">
          <Gift className="h-12 w-12 mx-auto opacity-90" />
          <h2 className="text-3xl font-bold">Programme de fidélité</h2>
          <p className="text-xl opacity-90 max-w-xl mx-auto">
            Gagnez des points à chaque commande et réservation. Débloquez des avantages exclusifs dès 1 000 points.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { tier: '🥉 Bronze', pts: '0 pts', color: 'bg-orange-400' },
              { tier: '🥈 Argent', pts: '1 000 pts', color: 'bg-orange-400' },
              { tier: '🥇 Or', pts: '5 000 pts', color: 'bg-orange-400' },
              { tier: '💎 Platine', pts: '15 000 pts', color: 'bg-orange-400' },
            ].map(({ tier, pts }) => (
              <div key={tier} className="bg-white/20 rounded-lg p-4">
                <p className="font-semibold text-sm">{tier}</p>
                <p className="text-xs opacity-80">{pts}</p>
              </div>
            ))}
          </div>
          <Link href="/auth/inscription">
            <Button size="lg" className="bg-white text-orange-500 hover:bg-orange-50 mt-4">
              Rejoindre gratuitement
            </Button>
          </Link>
        </div>
      </section>

      {/* Chiffres clés */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '50+', label: 'Restaurants partenaires' },
              { value: '10 000+', label: 'Clients satisfaits' },
              { value: '30 min', label: 'Livraison moyenne' },
              { value: '4.8/5', label: 'Note moyenne' },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-4xl font-bold text-orange-500">{value}</p>
                <p className="text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

const FEATURED_RESTAURANTS = [
  { id: 'r1', name: 'Le Bœuf Couronné', cuisine: 'Brasserie', city: 'Paris 8e', rating: '4.8', deliveryTime: '25-35 min', emoji: '🥩' },
  { id: 'r2', name: 'Sakura Garden', cuisine: 'Japonais', city: 'Paris 6e', rating: '4.9', deliveryTime: '30-45 min', emoji: '🍜' },
  { id: 'r3', name: 'La Trattoria', cuisine: 'Italien', city: 'Paris 11e', rating: '4.7', deliveryTime: '20-30 min', emoji: '🍕' },
]
