'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Users, Clock, CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const AVAILABLE_SLOTS = ['12:00', '12:30', '13:00', '19:00', '19:30', '20:00', '20:30', '21:00']

type Step = 'form' | 'confirm' | 'success'

export default function ReservationPage({ params }: { params: { id: string } }) {
  const [step, setStep] = useState<Step>('form')
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState('2')
  const [slot, setSlot] = useState('')
  const [requests, setRequests] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
    setStep('success')
  }

  if (step === 'success') {
    return (
      <div className="container py-20 max-w-lg mx-auto text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-2">Réservation confirmée !</h1>
        <p className="text-gray-500 mb-6">
          Votre table est réservée pour le <strong>{formatDate(date)}</strong> à <strong>{slot}</strong> pour <strong>{guests} personnes</strong>.
        </p>
        <p className="text-sm text-gray-400 mb-8">Un email de confirmation vous a été envoyé. Vous recevrez un rappel la veille.</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => setStep('form')}>Nouvelle réservation</Button>
          <Button asChild><a href="/mon-compte/reservations">Mes réservations</a></Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Réserver une table</h1>
        <p className="text-gray-500">Le Bœuf Couronné — Paris 8e</p>
      </div>

      <div className="space-y-6">
        {/* Étape 1 : Infos */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-orange-500" />Votre réservation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre de couverts</Label>
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} {n === 1 ? 'personne' : 'personnes'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {date && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Clock className="h-4 w-4" />Créneau horaire</Label>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SLOTS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSlot(s)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        slot === s
                          ? 'bg-orange-500 text-white border-orange-500'
                          : 'border-gray-200 hover:border-orange-300 hover:text-orange-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="requests">Demandes spéciales (optionnel)</Label>
              <Input
                id="requests"
                placeholder="Allergie, chaise haute, table en terrasse..."
                value={requests}
                onChange={(e) => setRequests(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Récap */}
        {date && slot && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">Récapitulatif</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Restaurant :</strong> Le Bœuf Couronné</p>
                <p><strong>Date :</strong> {formatDate(date)}</p>
                <p><strong>Heure :</strong> {slot}</p>
                <p><strong>Couverts :</strong> {guests}</p>
                {requests && <p><strong>Demandes :</strong> {requests}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-base"
          disabled={!date || !slot || loading}
          onClick={handleConfirm}
        >
          {loading ? 'Réservation en cours...' : 'Confirmer la réservation'}
        </Button>

        <p className="text-xs text-center text-gray-400">
          Annulation gratuite jusqu'à 2h avant. Réservation idempotente — pas de doublon possible.
        </p>
      </div>
    </div>
  )
}
