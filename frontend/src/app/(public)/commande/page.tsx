'use client'

import { useState } from 'react'
import { useCart } from '@/hooks/useCart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ShoppingCart, Truck, ShoppingBag, Minus, Plus, Trash2, MapPin, CheckCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type OrderType = 'CLICK_AND_COLLECT' | 'DELIVERY'
type Step = 'cart' | 'delivery' | 'payment' | 'success'

export default function OrderPage() {
  const { items, updateQuantity, removeItem, clear, totalPrice, restaurantId } = useCart()
  const [orderType, setOrderType] = useState<OrderType>('CLICK_AND_COLLECT')
  const [address, setAddress] = useState('')
  const [step, setStep] = useState<Step>('cart')
  const [loading, setLoading] = useState(false)
  const [orderId] = useState('ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase())
  const router = useRouter()

  const subtotal = totalPrice()
  const deliveryFee = orderType === 'DELIVERY' ? 2.99 : 0
  const tax = subtotal * 0.1
  const total = subtotal + deliveryFee + tax

  const handleOrder = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 2000))
    setLoading(false)
    clear()
    setStep('success')
  }

  if (step === 'success') {
    return (
      <div className="container py-20 max-w-lg mx-auto text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-2">Commande confirmée !</h1>
        <p className="text-gray-500 mb-2">Commande <strong>{orderId}</strong></p>
        <p className="text-gray-500 mb-8">
          {orderType === 'DELIVERY'
            ? 'Votre commande est en préparation. Livraison estimée : 30-45 min.'
            : 'Votre commande est en préparation. Retrait estimé : 20-25 min.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline"><Link href="/restaurants">Continuer</Link></Button>
          <Button asChild><Link href="/mon-compte/commandes">Suivre ma commande</Link></Button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 max-w-lg mx-auto text-center">
        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-2">Votre panier est vide</h1>
        <p className="text-gray-500 mb-8">Ajoutez des plats depuis le menu d'un restaurant.</p>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/restaurants">Parcourir les restaurants</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Votre commande</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gauche : Articles + Type */}
        <div className="lg:col-span-2 space-y-6">
          {/* Type de commande */}
          <Card>
            <CardHeader><CardTitle>Mode de récupération</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setOrderType('CLICK_AND_COLLECT')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                    orderType === 'CLICK_AND_COLLECT' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <ShoppingBag className={`h-6 w-6 ${orderType === 'CLICK_AND_COLLECT' ? 'text-orange-500' : 'text-gray-400'}`} />
                  <span className="font-medium text-sm">Click & Collect</span>
                  <span className="text-xs text-gray-500">Gratuit · 20-25 min</span>
                </button>
                <button
                  onClick={() => setOrderType('DELIVERY')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                    orderType === 'DELIVERY' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'
                  }`}
                >
                  <Truck className={`h-6 w-6 ${orderType === 'DELIVERY' ? 'text-orange-500' : 'text-gray-400'}`} />
                  <span className="font-medium text-sm">Livraison</span>
                  <span className="text-xs text-gray-500">2,99 € · 30-45 min</span>
                </button>
              </div>

              {orderType === 'DELIVERY' && (
                <div className="mt-4 space-y-2">
                  <Label htmlFor="address">Adresse de livraison</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="address"
                      className="pl-9"
                      placeholder="42 rue de la Paix, Paris 75001"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Articles */}
          <Card>
            <CardHeader><CardTitle>Articles ({items.length})</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.menuItemId} className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-medium">{item.itemName}</p>
                    <p className="text-sm text-gray-500">{formatPrice(item.unitPrice)} / unité</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center font-semibold">{item.quantity}</span>
                    <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="font-semibold w-20 text-right">{formatPrice(item.unitPrice * item.quantity)}</span>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => removeItem(item.menuItemId)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Droite : Récapitulatif */}
        <div>
          <Card className="sticky top-24">
            <CardHeader><CardTitle>Résumé</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {orderType === 'DELIVERY' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frais de livraison</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">TVA (10%)</span>
                <span>{formatPrice(tax)}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="promo">Code promo</Label>
                <div className="flex gap-2">
                  <Input id="promo" placeholder="WELCOME10" />
                  <Button variant="outline" size="sm">Appliquer</Button>
                </div>
              </div>

              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-orange-500">{formatPrice(total)}</span>
              </div>

              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 h-12"
                onClick={handleOrder}
                disabled={loading || (orderType === 'DELIVERY' && !address)}
              >
                {loading ? 'Traitement...' : `Payer ${formatPrice(total)}`}
              </Button>

              <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
                🔒 Paiement sécurisé par Stripe
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
