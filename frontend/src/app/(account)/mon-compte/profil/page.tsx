'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, CheckCircle } from 'lucide-react'
import { apiClient } from '@/lib/api/client'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '' })
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session?.user) {
      const [firstName, ...rest] = (session.user.name ?? '').split(' ')
      setForm({ firstName, lastName: rest.join(' '), phone: '' })
    }
  }, [session])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handlePwdChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPwdForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiClient.patch('/api/v1/users/me', form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Erreur lors de la mise à jour.')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    setSavingPwd(true)
    try {
      await apiClient.patch('/api/v1/users/me/password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      })
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Mot de passe actuel incorrect.')
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mon profil</h1>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          <CheckCircle className="h-4 w-4" /> Modifications enregistrées
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Infos personnelles */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Informations personnelles</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={session?.user?.email ?? ''} disabled className="bg-gray-50" />
              <p className="text-xs text-gray-400">L'email ne peut pas être modifié ici.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" name="phone" placeholder="+33 6 12 34 56 78" value={form.phone} onChange={handleChange} />
            </div>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={saving}>
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Changement de mot de passe */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" />Changer le mot de passe</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleChangePwd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Mot de passe actuel</Label>
              <Input id="currentPassword" name="currentPassword" type="password" value={pwdForm.currentPassword} onChange={handlePwdChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input id="newPassword" name="newPassword" type="password" placeholder="Minimum 8 caractères" value={pwdForm.newPassword} onChange={handlePwdChange} required minLength={8} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" value={pwdForm.confirmPassword} onChange={handlePwdChange} required />
            </div>
            <Button type="submit" variant="outline" disabled={savingPwd}>
              {savingPwd ? 'Modification...' : 'Changer le mot de passe'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
