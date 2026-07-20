'use client'

import { use, useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'

const fetcher = (url: string) => apiClient.get(url).then((r) => r.data)

export default function AdminMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: items, isLoading, mutate } = useSWR(`/api/v1/menus/restaurant/${id}`, fetcher)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '' })
  const [saving, setSaving] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiClient.post('/api/v1/menus', { ...form, restaurantId: id, price: parseFloat(form.price) })
      mutate()
      setForm({ name: '', description: '', price: '', categoryId: '' })
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  const toggleAvailability = async (itemId: string, available: boolean) => {
    await apiClient.patch(`/api/v1/menus/${itemId}/availability`, { available: !available })
    mutate()
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Supprimer cet article ?')) return
    await apiClient.delete(`/api/v1/menus/${itemId}`)
    mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/admin/restaurants/${id}`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <h1 className="text-2xl font-bold">Gestion du menu</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-orange-500 hover:bg-orange-600 gap-2">
          <Plus className="h-4 w-4" />Ajouter un plat
        </Button>
      </div>

      {/* Formulaire ajout */}
      {showForm && (
        <Card className="border-orange-200">
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du plat</Label>
                  <Input id="name" name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (€)</Label>
                  <Input id="price" name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" value={form.description} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Catégorie</Label>
                <Input id="categoryId" name="categoryId" placeholder="entrées, plats, desserts..." value={form.categoryId} onChange={handleChange} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={saving}>
                  {saving ? 'Ajout...' : 'Ajouter'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des plats */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {(items ?? []).map((item: any) => (
            <Card key={item._id} className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant={item.available ? 'default' : 'secondary'} className={item.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}>
                        {item.available ? 'Disponible' : 'Indisponible'}
                      </Badge>
                      {item.categoryId && <Badge variant="outline" className="text-xs">{item.categoryId}</Badge>}
                    </div>
                    <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleAvailability(item._id, item.available)}>
                      {item.available ? <ToggleRight className="h-4 w-4 text-green-500" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => handleDelete(item._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {(items ?? []).length === 0 && (
            <div className="text-center py-12 text-gray-400">Aucun plat dans ce menu.</div>
          )}
        </div>
      )}
    </div>
  )
}
