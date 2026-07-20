'use client'

import { use } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, Clock, Users, FileText, ArrowLeft } from 'lucide-react'
import { formatDate, RESERVATION_STATUS_LABELS } from '@/lib/utils'
import Link from 'next/link'
import { apiClient } from '@/lib/api/client'

const fetcher = (url: string) => apiClient.get(url).then((r) => r.data)

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
}

export default function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: r, isLoading, mutate } = useSWR(`/api/v1/reservations/${id}`, fetcher)

  const handleCancel = async () => {
    if (!confirm('Annuler cette réservation ?')) return
    await apiClient.delete(`/api/v1/reservations/${id}`)
    mutate()
  }

  if (isLoading) return <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
  if (!r) return <p className="text-gray-500">Réservation introuvable.</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/mon-compte/reservations"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Détail de la réservation</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{r.restaurantName ?? 'Restaurant'}</CardTitle>
            <Badge className={STATUS_COLORS[r.status] ?? 'bg-gray-100'}>
              {RESERVATION_STATUS_LABELS[r.status as keyof typeof RESERVATION_STATUS_LABELS] ?? r.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-gray-500">Date</p>
                <p className="font-medium">{formatDate(r.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-gray-500">Heure</p>
                <p className="font-medium">{r.timeSlot}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-gray-500">Convives</p>
                <p className="font-medium">{r.guestCount} personnes</p>
              </div>
            </div>
          </div>

          {r.specialRequests && (
            <div className="flex items-start gap-2 text-sm">
              <FileText className="h-4 w-4 text-orange-500 mt-0.5" />
              <div>
                <p className="text-gray-500">Demandes spéciales</p>
                <p className="font-medium italic">"{r.specialRequests}"</p>
              </div>
            </div>
          )}

          {r.status === 'CONFIRMED' && (
            <Button variant="destructive" onClick={handleCancel} className="w-full">
              Annuler la réservation
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
