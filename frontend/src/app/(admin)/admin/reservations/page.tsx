'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CalendarDays, Clock, Users, Search } from 'lucide-react'
import { formatDate, RESERVATION_STATUS_LABELS } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'

const fetcher = (url: string) => apiClient.get(url).then((r) => r.data)

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
  NO_SHOW: 'bg-red-100 text-red-700',
}

export default function AdminReservationsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { data, isLoading, mutate } = useSWR(`/api/v1/reservations?size=50${statusFilter ? `&status=${statusFilter}` : ''}`, fetcher)

  const reservations = (data?.content ?? []).filter((r: any) =>
    !search || r.customerName?.toLowerCase().includes(search.toLowerCase()) || r.restaurantName?.toLowerCase().includes(search.toLowerCase())
  )

  const confirmReservation = async (id: string) => {
    await apiClient.patch(`/api/v1/reservations/${id}/confirm`)
    mutate()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Réservations</h1>
        <p className="text-gray-500">{data?.totalElements ?? 0} réservation(s) au total</p>
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
          <option value="PENDING">En attente</option>
          <option value="CONFIRMED">Confirmée</option>
          <option value="CANCELLED">Annulée</option>
          <option value="COMPLETED">Terminée</option>
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {reservations.map((r: any) => (
            <Card key={r.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{r.customerName ?? r.userId?.slice(0, 8)}</span>
                      <span className="text-gray-400">·</span>
                      <span className="text-gray-600">{r.restaurantName ?? 'Restaurant'}</span>
                      <Badge className={STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-600'}>
                        {RESERVATION_STATUS_LABELS[r.status as keyof typeof RESERVATION_STATUS_LABELS] ?? r.status}
                      </Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDate(r.date)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{r.timeSlot}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{r.guestCount} pers.</span>
                    </div>
                  </div>
                  {r.status === 'PENDING' && (
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 shrink-0" onClick={() => confirmReservation(r.id)}>
                      Confirmer
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {reservations.length === 0 && <p className="text-center text-gray-400 py-12">Aucune réservation trouvée.</p>}
        </div>
      )}
    </div>
  )
}
