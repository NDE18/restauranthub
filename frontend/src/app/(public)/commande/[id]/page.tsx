'use client'

import { use, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Clock, ChefHat, Package, Bike, MapPin } from 'lucide-react'
import { formatPrice, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useDeliverySocket } from '@/hooks/useSocket'

const STATUS_STEPS = [
  { key: 'CREATED', label: 'Commande reçue', icon: CheckCircle },
  { key: 'PAID', label: 'Paiement confirmé', icon: CheckCircle },
  { key: 'IN_PREPARATION', label: 'En préparation', icon: ChefHat },
  { key: 'READY', label: 'Prête', icon: Package },
  { key: 'PICKED_UP', label: 'Prise en charge', icon: Bike },
  { key: 'DELIVERED', label: 'Livrée', icon: CheckCircle },
]

const MOCK_ORDER = {
  id: 'order-123',
  status: 'IN_PREPARATION' as const,
  orderType: 'DELIVERY' as const,
  restaurantName: 'Le Bistrot Parisien',
  createdAt: new Date().toISOString(),
  items: [
    { name: 'Steak Frites', quantity: 1, unitPrice: 18.5 },
    { name: 'Crème Brûlée', quantity: 2, unitPrice: 7.0 },
  ],
  subtotal: 32.5,
  deliveryFee: 2.99,
  tax: 3.25,
  total: 38.74,
  deliveryAddress: '42 rue de la Paix, Paris 75001',
}

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order] = useState(MOCK_ORDER)
  const [driverPosition, setDriverPosition] = useState<{ lat: number; lng: number } | null>(null)
  const { location, status: deliveryStatus } = useDeliverySocket(
    order.orderType === 'DELIVERY' ? id : null
  )

  useEffect(() => {
    if (location) setDriverPosition(location)
  }, [location])

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status)

  return (
    <div className="container py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Commande #{id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-gray-500 text-sm mt-1">{order.restaurantName} · {formatDate(order.createdAt)}</p>
        </div>
        <Badge className="bg-orange-100 text-orange-700 text-sm px-3 py-1">
          {order.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Stepper */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Suivi en temps réel</CardTitle></CardHeader>
        <CardContent>
          <div className="relative">
            {STATUS_STEPS.slice(0, order.orderType === 'DELIVERY' ? 6 : 4).map((step, i) => {
              const Icon = step.icon
              const done = i <= currentStepIndex
              const active = i === currentStepIndex
              return (
                <div key={step.key} className="flex items-start gap-4 mb-4 last:mb-0">
                  <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    done ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className={`font-medium ${active ? 'text-orange-600' : done ? 'text-gray-900' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {active && <p className="text-sm text-orange-500 animate-pulse">En cours...</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* GPS live */}
      {order.orderType === 'DELIVERY' && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Position du livreur</CardTitle></CardHeader>
          <CardContent>
            {driverPosition ? (
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="font-medium">Livreur en route</p>
                  <p className="text-sm">Lat: {driverPosition.lat.toFixed(4)}, Lng: {driverPosition.lng.toFixed(4)}</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Bike className="h-8 w-8 mx-auto mb-2" />
                  <p>En attente d'un livreur...</p>
                </div>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-3 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Livraison à : {order.deliveryAddress}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Récapitulatif */}
      <Card>
        <CardHeader><CardTitle>Récapitulatif</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.name}</span>
              <span>{formatPrice(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Sous-total</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.orderType === 'DELIVERY' && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Livraison</span><span>{formatPrice(order.deliveryFee)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-500">
            <span>TVA (10%)</span><span>{formatPrice(order.tax)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span><span className="text-orange-500">{formatPrice(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/restaurants">Commander à nouveau</Link>
        </Button>
      </div>
    </div>
  )
}
