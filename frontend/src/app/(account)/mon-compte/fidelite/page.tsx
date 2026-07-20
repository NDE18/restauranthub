'use client'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Star, Gift, Trophy, Copy } from 'lucide-react'
import { formatDate, TIER_LABELS, TIER_COLORS } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'

const fetcher = (url: string) => apiClient.get(url).then((r) => r.data)

const TIER_THRESHOLDS: Record<string, number> = {
  BRONZE: 1000,
  SILVER: 5000,
  GOLD: 15000,
  PLATINUM: Infinity,
}

const TIER_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM']

export default function LoyaltyPage() {
  const { data: account, isLoading } = useSWR('/api/v1/loyalty/me', fetcher)
  const { data: txData } = useSWR('/api/v1/loyalty/me/transactions', fetcher)
  const { data: rewards } = useSWR('/api/v1/loyalty/rewards', fetcher)

  if (isLoading) return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}</div>

  const tier = account?.tier ?? 'BRONZE'
  const points = account?.pointsBalance ?? 0
  const nextTier = TIER_ORDER[TIER_ORDER.indexOf(tier) + 1]
  const nextThreshold = TIER_THRESHOLDS[tier]
  const progress = nextTier ? Math.min((points / nextThreshold) * 100, 100) : 100

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Programme de fidélité</h1>

      {/* Status card */}
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-orange-100 text-sm">Votre niveau</p>
              <p className="text-3xl font-bold">{TIER_LABELS[tier as keyof typeof TIER_LABELS] ?? tier}</p>
            </div>
            <Trophy className="h-12 w-12 text-orange-200" />
          </div>
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-4xl font-bold">{points.toLocaleString()}</p>
              <p className="text-orange-100 text-sm">points</p>
            </div>
            {nextTier && (
              <p className="text-orange-100 text-sm text-right">
                {(nextThreshold - points).toLocaleString()} pts pour {TIER_LABELS[nextTier as keyof typeof TIER_LABELS]}
              </p>
            )}
          </div>
          {nextTier && <Progress value={progress} className="h-2 bg-orange-400" />}
        </CardContent>
      </Card>

      {/* Code parrainage */}
      {account?.referralCode && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5" />Code parrainage</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-gray-100 rounded-lg px-4 py-2 font-mono text-lg tracking-widest text-center">
                {account.referralCode}
              </code>
              <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(account.referralCode)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">Partagez ce code et gagnez 100 points par parrainage</p>
          </CardContent>
        </Card>
      )}

      {/* Récompenses disponibles */}
      {rewards?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5" />Récompenses disponibles</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {rewards.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm text-gray-500">{r.pointsCost} points</p>
                </div>
                <Button size="sm" variant="outline" disabled={points < r.pointsCost}
                  className={points >= r.pointsCost ? 'border-orange-500 text-orange-500 hover:bg-orange-50' : ''}>
                  Échanger
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Historique */}
      {txData?.content?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Historique des points</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {txData.content.slice(0, 10).map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{tx.description}</p>
                  <p className="text-gray-400 text-xs">{formatDate(tx.createdAt)}</p>
                </div>
                <span className={`font-bold ${tx.points > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.points > 0 ? '+' : ''}{tx.points} pts
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
