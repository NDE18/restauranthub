'use client'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trophy, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { TIER_LABELS } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'

const fetcher = (url: string) => apiClient.get(url).then((r) => r.data)

const TIER_COLORS_ADMIN: Record<string, string> = {
  BRONZE: 'bg-amber-100 text-amber-700',
  SILVER: 'bg-gray-100 text-gray-600',
  GOLD: 'bg-yellow-100 text-yellow-700',
  PLATINUM: 'bg-blue-100 text-blue-700',
}

export default function AdminLoyaltyPage() {
  const { data: rewards, isLoading, mutate } = useSWR('/api/v1/loyalty/rewards', fetcher)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', pointsCost: '', description: '' })
  const [saving, setSaving] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiClient.post('/api/v1/loyalty/rewards', { ...form, pointsCost: parseInt(form.pointsCost) })
      mutate()
      setForm({ name: '', pointsCost: '', description: '' })
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette récompense ?')) return
    await apiClient.delete(`/api/v1/loyalty/rewards/${id}`)
    mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Programme de fidélité</h1>
          <p className="text-gray-500">Gestion des récompenses et tiers</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-orange-500 hover:bg-orange-600 gap-2">
          <Plus className="h-4 w-4" />Nouvelle récompense
        </Button>
      </div>

      {/* Tiers info */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[['BRONZE', 0], ['SILVER', 1000], ['GOLD', 5000], ['PLATINUM', 15000]].map(([tier, threshold]) => (
          <Card key={tier}>
            <CardContent className="pt-5 text-center">
              <Trophy className={`h-8 w-8 mx-auto mb-2 ${tier === 'GOLD' ? 'text-yellow-500' : tier === 'SILVER' ? 'text-gray-400' : tier === 'PLATINUM' ? 'text-blue-500' : 'text-amber-600'}`} />
              <Badge className={TIER_COLORS_ADMIN[tier as string]}>
                {TIER_LABELS[tier as keyof typeof TIER_LABELS]}
              </Badge>
              <p className="text-sm text-gray-500 mt-2">À partir de {threshold as number > 0 ? `${(threshold as number).toLocaleString()} pts` : '0 pt'}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulaire récompense */}
      {showForm && (
        <Card className="border-orange-200">
          <CardHeader><CardTitle>Nouvelle récompense</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input id="name" name="name" value={form.name} onChange={handleChange} required placeholder="Ex: Boisson offerte" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pointsCost">Coût en points</Label>
                  <Input id="pointsCost" name="pointsCost" type="number" min="1" value={form.pointsCost} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" value={form.description} onChange={handleChange} placeholder="Description de la récompense" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={saving}>{saving ? 'Ajout...' : 'Ajouter'}</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Récompenses */}
      <Card>
        <CardHeader><CardTitle>Récompenses disponibles ({(rewards ?? []).length})</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
          ) : (rewards ?? []).length === 0 ? (
            <p className="text-gray-400 text-center py-6">Aucune récompense configurée.</p>
          ) : (
            (rewards ?? []).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm text-gray-500">{r.pointsCost} points{r.description ? ` · ${r.description}` : ''}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => handleDelete(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
