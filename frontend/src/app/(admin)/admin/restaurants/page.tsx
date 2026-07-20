'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Plus, MapPin, Star } from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/api/client'

const fetcher = (url: string) => apiClient.get(url).then((r) => r.data)

export default function AdminRestaurantsPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading, mutate } = useSWR('/api/v1/restaurants?size=50', fetcher)

  const restaurants = (data?.content ?? []).filter((r: any) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Restaurants</h1>
          <p className="text-gray-500">{data?.totalElements ?? 0} restaurant(s) au total</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 gap-2">
          <Plus className="h-4 w-4" />Ajouter
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher un restaurant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {restaurants.map((r: any) => (
            <Card key={r.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{r.name}</h3>
                      <Badge variant={r.isActive ? 'default' : 'secondary'} className={r.isActive ? 'bg-green-100 text-green-700' : ''}>
                        {r.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{r.address}</span>
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />{r.averageRating?.toFixed(1) ?? 'N/A'}</span>
                      <span>{r.cuisineType}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/restaurants/${r.id}`}>Modifier</Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/restaurants/${r.id}/menus`}>Menus</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
