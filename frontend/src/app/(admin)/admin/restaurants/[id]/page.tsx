'use client'

import { use, useState, useEffect } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/api/client'

const fetcher = (url: string) => apiClient.get(url).then((r) => r.data)

const CUISINE_TYPES = ['FRENCH', 'ITALIAN', 'JAPANESE', 'MEXICAN', 'INDIAN', 'CHINESE', 'AMERICAN', 'MEDITERRANEAN']

export default function AdminRestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const isNew = id === 'new'
  const { data: r, mutate } = useSWR(isNew ? null : `/api/v1/restaurants/${id}`, fetcher)
  const [form, setForm] = useState({ name: '', description: '', address: '', cuisineType: 'FRENCH', phone: '', email: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (r) setForm({ name: r.name, description: r.description ?? '', address: r.address, cuisineType: r.cuisineType, phone: r.phone ?? '', email: r.email ?? '' })
  }, [r])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isNew) {
        await apiClient.post('/api/v1/restaurants', form)
      } else {
        await apiClient.patch(`/api/v1/restaurants/${id}`, form)
        mutate()
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/restaurants"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isNew ? 'Nouveau restaurant' : r?.name ?? '...'}</h1>
          {!isNew && r && <Badge variant={r.isActive ? 'default' : 'secondary'} className={r.isActive ? 'bg-green-100 text-green-700' : ''}>{r.isActive ? 'Actif' : 'Inactif'}</Badge>}
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          <CheckCircle className="h-4 w-4" /> Enregistré avec succès
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Informations générales</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du restaurant</Label>
              <Input id="name" name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description" name="description"
                value={form.description} onChange={handleChange}
                rows={3}
                className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Description du restaurant..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" name="address" value={form.address} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cuisineType">Type de cuisine</Label>
              <select
                id="cuisineType" name="cuisineType"
                value={form.cuisineType} onChange={handleChange}
                className="w-full border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {CUISINE_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
            </div>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 gap-2" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
