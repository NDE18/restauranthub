'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Truck, ShoppingBag } from 'lucide-react'
import { formatPrice, formatDate, ORDER_STATUS_LABELS } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'

const fetcher = (url: string) => apiClient.get(url).then((r) => r.data)

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

const STATUS_TRANSITIONS: Record<string, string> = {
  PAID: 'IN_PREPARATION',
  IN_PREPARATION: 'READY',
  READY: 'PICKED_UP',
}

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { data, isLoading, mutate } = useSWR(`/api/v1/orders?size=50${statusFilter ? `&status=${statusFilter}` : ''}`, fetcher)

  const orders = (data?.content ?? []).filter((o: any) =>
    !search || o.restaurantName?.toLowerCase().includes(search.toLowerCase())
  )

  const advanceStatus = async (id: string, currentStatus: string) => {
    const nextStatus = STATUS_TRANSITIONS[currentStatus]
    if (!nextStatus) return
    await apiClient.patch(`/api/v1/orders/${id}/status`, { status: nextStatus })
    mutate()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Commandes</h1>
        <p className="text-gray-500">{data?.totalElements ?? 0} commande(s)</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-input rounded-md px-3 py-2 text-sm"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o: any) => (
            <Card key={o.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-sm font-semibold">#{o.id?.slice(0, 8).toUpperCase()}</span>
                      <span className="text-gray-400">·</span>
                      <span>{o.restaurantName ?? 'Restaurant'}</span>
                      <Badge className={STATUS_COLORS[o.status] ?? 'bg-gray-100'}>
                        {ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS] ?? o.status}
                      </Badge>
                      <Badge variant="outline" className="gap-1 text-xs">
                        {o.orderType === 'DELIVERY' ? <Truck className="h-3 w-3" /> : <ShoppingBag className="h-3 w-3" />}
                        {o.orderType === 'DELIVERY' ? 'Livraison' : 'C&C'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(o.createdAt)} · {formatPrice(o.totalAmount)}
                    </div>
                  </div>
                  {STATUS_TRANSITIONS[o.status] && (
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600 shrink-0" onClick={() => advanceStatus(o.id, o.status)}>
                      → {ORDER_STATUS_LABELS[STATUS_TRANSITIONS[o.status] as keyof typeof ORDER_STATUS_LABELS]}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {orders.length === 0 && <p className="text-center text-gray-400 py-12">Aucune commande trouvée.</p>}
        </div>
      )}
    </div>
  )
}
