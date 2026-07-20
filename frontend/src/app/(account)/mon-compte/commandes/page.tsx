'use client'

import useSWR from 'swr'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Truck, ShoppingCart } from 'lucide-react'
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils'
import Link from 'next/link'
import { apiClient } from '@/lib/api/client'

const STATUS_COLORS: Record<string, string> = {
  CREATED: 'bg-gray-100 text-gray-600',
  PAID: 'bg-blue-100 text-blue-700',
  IN_PREPARATION: 'bg-yellow-100 text-yellow-700',
  READY: 'bg-orange-100 text-orange-700',
  PICKED_UP: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const fetcher = (url: string) => apiClient.get(url).then((r) => r.data)

export default function MyOrdersPage() {
  const { data, isLoading } = useSWR('/api/v1/orders/my', fetcher)

  if (isLoading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>

  const orders = data?.content ?? []

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Aucune commande</h2>
        <p className="text-gray-500 mb-6">Vous n'avez pas encore passé de commande.</p>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/restaurants">Commander maintenant</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mes commandes</h1>
      <div className="space-y-4">
        {orders.map((o: any) => (
          <Card key={o.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{o.restaurantName ?? 'Restaurant'}</h3>
                    <Badge className={STATUS_COLORS[o.status] ?? 'bg-gray-100 text-gray-600'}>
                      {ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS] ?? o.status}
                    </Badge>
                    <Badge variant="outline" className="gap-1 text-xs">
                      {o.orderType === 'DELIVERY' ? <Truck className="h-3 w-3" /> : <ShoppingBag className="h-3 w-3" />}
                      {o.orderType === 'DELIVERY' ? 'Livraison' : 'Click & Collect'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(o.createdAt)} · {o.items?.length ?? 0} article(s)</p>
                  <p className="font-semibold text-orange-500">{formatPrice(o.totalAmount)}</p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/mon-compte/commandes/${o.id}`}>Détails</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
