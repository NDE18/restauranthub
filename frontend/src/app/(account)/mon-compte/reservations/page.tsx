'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, Clock, Users, MapPin } from 'lucide-react'
import { formatDate, formatTime, RESERVATION_STATUS_LABELS } from '@/lib/utils'
import Link from 'next/link'
import { apiClient } from '@/lib/api/client'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-gray-100 text-gray-600',
  NO_SHOW: 'bg-red-100 text-red-700',
}

const fetcher = (url: string) => apiClient.get(url).then((r) => r.data)

export default function MyReservationsPage() {
  const { data, isLoading } = useSWR('/api/v1/reservations/my', fetcher)

  if (isLoading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>

  const reservations = data?.content ?? []

  if (reservations.length === 0) {
    return (
      <div className="text-center py-20">
        <CalendarDays className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Aucune réservation</h2>
        <p className="text-gray-500 mb-6">Vous n'avez pas encore effectué de réservation.</p>
        <Button asChild className="bg-orange-500 hover:bg-orange-600">
          <Link href="/restaurants">Explorer les restaurants</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mes réservations</h1>
      <div className="space-y-4">
        {reservations.map((r: any) => (
          <Card key={r.id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{r.restaurantName ?? 'Restaurant'}</h3>
                    <Badge className={STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-600'}>
                      {RESERVATION_STATUS_LABELS[r.status as keyof typeof RESERVATION_STATUS_LABELS] ?? r.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" />{formatDate(r.date)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{r.timeSlot}</span>
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" />{r.guestCount} personnes</span>
                  </div>
                  {r.specialRequests && <p className="text-sm text-gray-500 italic">"{r.specialRequests}"</p>}
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/mon-compte/reservations/${r.id}`}>Détails</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
