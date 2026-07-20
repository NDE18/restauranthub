'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Bike, Clock } from 'lucide-react'
import { formatDate, formatPrice } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'

const fetcher = (url: string) => apiClient.get(url).then((r) => r.data)

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-600',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  PICKED_UP: 'bg-yellow-100 text-yellow-700',
  IN_TRANSIT: 'bg-orange-100 text-orange-700',
  DELIVERED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  ASSIGNED: 'Assignée',
  PICKED_UP: 'Récupérée',
  IN_TRANSIT: 'En transit',
  DELIVERED: 'Livrée',
  FAILED: 'Échouée',
}

export default function AdminDeliveriesPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { data, isLoading, mutate } = useSWR(`/api/v1/deliveries?size=50${statusFilter ? `&status=${statusFilter}` : ''}`, fetcher)

  const deliveries = (data?.content ?? []).filter((d: any) =>
    !search || d.deliveryAddress?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Livraisons</h1>
        <p className="text-gray-500">{data?.totalElements ?? 0} livraison(s)</p>
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
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {deliveries.map((d: any) => (
            <Card key={d.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold">#{d.id?.slice(0, 8).toUpperCase()}</span>
                      <Badge className={STATUS_COLORS[d.status] ?? 'bg-gray-100 text-gray-600'}>
                        {STATUS_LABELS[d.status] ?? d.status}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{d.deliveryAddress ?? 'Adresse inconnue'}</span>
                      {d.driverName && <span className="flex items-center gap-1"><Bike className="h-3 w-3" />{d.driverName}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(d.createdAt)}</span>
                      {d.deliveryFee && <span>{formatPrice(d.deliveryFee)}</span>}
                    </div>
                  </div>
                  {d.status === 'PENDING' && (
                    <Badge className="bg-orange-100 text-orange-700 animate-pulse shrink-0">En attente livreur</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {deliveries.length === 0 && <p className="text-center text-gray-400 py-12">Aucune livraison trouvée.</p>}
        </div>
      )}
    </div>
  )
}
