'use client'

import { use } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Truck, ShoppingBag } from 'lucide-react'
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'

const fetcher = (url: string) => apiClient.get(url).then((r) => r.data)

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: o, isLoading } = useSWR(`/api/v1/orders/${id}`, fetcher)

  if (isLoading) return <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
  if (!o) return <p className="text-gray-500">Commande introuvable.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/mon-compte/commandes"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Commande #{id.slice(0, 8).toUpperCase()}</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle>{o.restaurantName ?? 'Restaurant'}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                {o.orderType === 'DELIVERY' ? <Truck className="h-3 w-3" /> : <ShoppingBag className="h-3 w-3" />}
                {o.orderType === 'DELIVERY' ? 'Livraison' : 'Click & Collect'}
              </Badge>
              <Badge>{ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS] ?? o.status}</Badge>
            </div>
          </div>
          <p className="text-sm text-gray-500">Passée le {formatDate(o.createdAt)}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {o.items?.map((item: any, i: number) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.itemName}</span>
              <span>{formatPrice(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Sous-total</span><span>{formatPrice(o.subtotal ?? o.totalAmount)}</span>
          </div>
          {o.orderType === 'DELIVERY' && (
            <div className="flex justify-between text-sm text-gray-500">
              <span>Frais de livraison</span><span>{formatPrice(o.deliveryFee ?? 2.99)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-500">
            <span>TVA</span><span>{formatPrice(o.tax ?? 0)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-orange-500">{formatPrice(o.totalAmount)}</span>
          </div>

          {['IN_PREPARATION', 'READY', 'PICKED_UP'].includes(o.status) && (
            <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
              <Link href={`/commande/${o.id}`}>Suivre ma commande</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
