'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, User, Ban } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'

const fetcher = (url: string) => apiClient.get(url).then((r) => r.data)

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-700',
}

export default function AdminClientsPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading, mutate } = useSWR('/api/v1/users?size=50', fetcher)

  const users = (data?.content ?? []).filter((u: any) =>
    !search || `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  )

  const suspendUser = async (id: string) => {
    if (!confirm('Suspendre ce compte ?')) return
    await apiClient.patch(`/api/v1/users/${id}/status`, { status: 'SUSPENDED' })
    mutate()
  }

  const activateUser = async (id: string) => {
    await apiClient.patch(`/api/v1/users/${id}/status`, { status: 'ACTIVE' })
    mutate()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="text-gray-500">{data?.totalElements ?? 0} client(s) enregistré(s)</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Rechercher par nom ou email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {users.map((u: any) => (
            <Card key={u.id}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{u.firstName} {u.lastName}</span>
                        <Badge className={STATUS_COLORS[u.status] ?? 'bg-gray-100 text-gray-600'}>
                          {u.status === 'ACTIVE' ? 'Actif' : u.status === 'SUSPENDED' ? 'Suspendu' : 'En attente'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{u.email} · Depuis {formatDate(u.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {u.status === 'ACTIVE' ? (
                      <Button size="sm" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 gap-1" onClick={() => suspendUser(u.id)}>
                        <Ban className="h-3 w-3" />Suspendre
                      </Button>
                    ) : u.status === 'SUSPENDED' ? (
                      <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => activateUser(u.id)}>
                        Réactiver
                      </Button>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {users.length === 0 && <p className="text-center text-gray-400 py-12">Aucun client trouvé.</p>}
        </div>
      )}
    </div>
  )
}
