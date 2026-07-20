'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Settings, Globe, Bell, Shield, CheckCircle } from 'lucide-react'

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    platformName: 'RestaurantHub',
    supportEmail: 'support@restauranthub.fr',
    defaultDeliveryFee: '2.99',
    taxRate: '10',
    maxDeliveryRadius: '15',
    minOrderAmount: '10',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-gray-500">Configuration générale de la plateforme</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          <CheckCircle className="h-4 w-4" />Paramètres sauvegardés
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Général */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" />Général</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platformName">Nom de la plateforme</Label>
              <Input id="platformName" name="platformName" value={form.platformName} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Email de support</Label>
              <Input id="supportEmail" name="supportEmail" type="email" value={form.supportEmail} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>

        {/* Commandes & livraison */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" />Commandes & Livraison</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultDeliveryFee">Frais de livraison (€)</Label>
                <Input id="defaultDeliveryFee" name="defaultDeliveryFee" type="number" step="0.01" value={form.defaultDeliveryFee} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">TVA (%)</Label>
                <Input id="taxRate" name="taxRate" type="number" value={form.taxRate} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDeliveryRadius">Rayon de livraison max (km)</Label>
                <Input id="maxDeliveryRadius" name="maxDeliveryRadius" type="number" value={form.maxDeliveryRadius} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minOrderAmount">Commande minimum (€)</Label>
                <Input id="minOrderAmount" name="minOrderAmount" type="number" step="0.50" value={form.minOrderAmount} onChange={handleChange} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Email de confirmation de commande', key: 'emailOrder' },
              { label: 'SMS de suivi de livraison', key: 'smsDelivery' },
              { label: 'Push notification (app mobile)', key: 'pushMobile' },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between">
                <Label className="cursor-pointer">{n.label}</Label>
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-orange-500" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
          Sauvegarder les paramètres
        </Button>
      </form>
    </div>
  )
}
