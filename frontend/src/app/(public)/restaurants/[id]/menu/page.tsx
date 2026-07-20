'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Plus, Minus, Leaf, AlertTriangle } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

const CATEGORIES = [
  {
    id: 'entrees', name: 'Entrées',
    items: [
      { id: 'e1', name: 'Tartare de bœuf maison', description: 'Bœuf haché, câpres, cornichons, jaune d\'œuf', price: 16.5, tags: ['Signature'], allergens: ['Œuf', 'Moutarde'] },
      { id: 'e2', name: 'Foie gras poêlé', description: 'Chutney de figues, brioche dorée', price: 22, tags: [], allergens: ['Gluten'] },
      { id: 'e3', name: 'Salade de chèvre chaud', description: 'Mâche, noix, miel, toasts dorés', price: 12, tags: ['Végétarien'], allergens: ['Lait', 'Gluten', 'Fruits à coque'] },
    ]
  },
  {
    id: 'plats', name: 'Plats',
    items: [
      { id: 'p1', name: 'Entrecôte maturée 300g', description: 'Maturation 45 jours, sauce bordelaise, frites maison', price: 38, tags: ['Signature', 'Bestseller'], allergens: ['Céleri'] },
      { id: 'p2', name: 'Filet de bœuf Wellington', description: 'En croûte de brioche, sauce truffe', price: 48, tags: [], allergens: ['Gluten', 'Lait', 'Œuf'] },
      { id: 'p3', name: 'Saumon grillé', description: 'Purée de céleri, vierge d\'agrumes', price: 28, tags: [], allergens: ['Poisson'] },
      { id: 'p4', name: 'Risotto aux champignons', description: 'Cèpes, parmesan, truffe noire', price: 24, tags: ['Végétarien'], allergens: ['Lait', 'Gluten'] },
    ]
  },
  {
    id: 'desserts', name: 'Desserts',
    items: [
      { id: 'd1', name: 'Soufflé au Grand Marnier', description: 'Servi à la minute (25 min)', price: 14, tags: [], allergens: ['Gluten', 'Lait', 'Œuf'] },
      { id: 'd2', name: 'Île flottante', description: 'Caramel beurre salé, pralin', price: 11, tags: [], allergens: ['Œuf', 'Lait', 'Fruits à coque'] },
      { id: 'd3', name: 'Tarte Tatin', description: 'Crème fraîche épaisse', price: 12, tags: [], allergens: ['Gluten', 'Lait', 'Œuf'] },
    ]
  },
  {
    id: 'boissons', name: 'Boissons',
    items: [
      { id: 'b1', name: 'Eau plate ou pétillante', description: 'Bouteille 75cl', price: 5, tags: [], allergens: [] },
      { id: 'b2', name: 'Verre de vin rouge', description: 'Sélection du sommelier', price: 9, tags: [], allergens: ['Sulfites'] },
      { id: 'b3', name: 'Jus de fruits frais', description: 'Pressé à la commande', price: 7, tags: ['Végétarien'], allergens: [] },
    ]
  },
]

export default function MenuPage({ params }: { params: { id: string } }) {
  const [activeCategory, setActiveCategory] = useState('entrees')
  const { addItem, items, updateQuantity } = useCart()
  const totalItems = items.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)

  const getItemQty = (itemId: string) => items.find((i) => i.menuItemId === itemId)?.quantity ?? 0

  return (
    <div className="container py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Menu — Le Bœuf Couronné</h1>
        <p className="text-gray-500 mt-1">Commandez pour emporter ou en livraison</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Menu */}
        <div className="flex-1">
          {/* Onglets catégories */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.id)}
                className="shrink-0"
              >
                {cat.name}
              </Button>
            ))}
          </div>

          {CATEGORIES.map((cat) => (
            <div key={cat.id} className={cat.id !== activeCategory ? 'hidden' : ''}>
              <div className="space-y-3">
                {cat.items.map((item) => {
                  const qty = getItemQty(item.id)
                  return (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-1">
                            <h3 className="font-semibold">{item.name}</h3>
                            {item.tags.map((t) => (
                              <Badge key={t} variant="secondary" className="text-xs shrink-0">
                                {t === 'Végétarien' ? <Leaf className="h-3 w-3 mr-1 text-green-600" /> : null}
                                {t}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                          {item.allergens.length > 0 && (
                            <p className="text-xs text-amber-600 flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Allergènes : {item.allergens.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-3 shrink-0">
                          <span className="font-bold text-orange-500">{formatPrice(item.price)}</span>
                          {qty === 0 ? (
                            <Button
                              size="sm"
                              onClick={() => addItem({ menuItemId: item.id, itemName: item.name, quantity: 1, unitPrice: item.price }, params.id)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, qty - 1)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center font-semibold">{qty}</span>
                              <Button size="icon" className="h-8 w-8" onClick={() => addItem({ menuItemId: item.id, itemName: item.name, quantity: 1, unitPrice: item.price }, params.id)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Panier */}
        <div className="lg:w-80 shrink-0">
          <Card className="sticky top-24">
            <CardContent className="p-5">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Votre commande
              </h2>

              {items.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Votre panier est vide</p>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    {items.map((item) => (
                      <div key={item.menuItemId} className="flex justify-between text-sm">
                        <span className="flex-1">{item.itemName} × {item.quantity}</span>
                        <span className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-3" />
                  <div className="flex justify-between font-semibold mb-4">
                    <span>Total</span>
                    <span className="text-orange-500">{formatPrice(totalPrice)}</span>
                  </div>
                  <Link href="/commande">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600">
                      Valider la commande ({totalItems})
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
