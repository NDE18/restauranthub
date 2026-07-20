'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Download, Trash2, AlertTriangle } from 'lucide-react'
import { apiClient } from '@/lib/api/client'

export default function GDPRPage() {
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await apiClient.get('/api/v1/users/me/data-export', { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mes-donnees-personnelles.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erreur lors de l\'export. Veuillez réessayer.')
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Cette action est irréversible. Toutes vos données seront supprimées définitivement. Continuer ?')) return
    setDeleting(true)
    try {
      await apiClient.delete('/api/v1/users/me')
      await signOut({ callbackUrl: '/' })
    } catch {
      alert('Erreur lors de la suppression. Veuillez réessayer.')
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Mes données personnelles</h1>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-orange-500" />Vos droits RGPD</CardTitle></CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-600">
          <p>Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :</p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Droit d'accès à vos données personnelles</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement ("droit à l'oubli")</li>
            <li>Droit à la portabilité des données</li>
            <li>Droit d'opposition au traitement</li>
          </ul>
        </CardContent>
      </Card>

      {/* Export */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" />Exporter mes données</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            Téléchargez une copie complète de toutes vos données personnelles au format JSON (profil, commandes, réservations, points fidélité).
          </p>
          <Button onClick={handleExport} disabled={exporting} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            {exporting ? 'Export en cours...' : 'Télécharger mes données'}
          </Button>
        </CardContent>
      </Card>

      {/* Suppression */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />Zone dangereuse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            La suppression de votre compte est définitive et irréversible. Toutes vos données seront anonymisées conformément au RGPD.
            Vos commandes et réservations passées seront conservées sous forme anonyme à des fins légales.
          </p>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            variant="destructive"
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? 'Suppression...' : 'Supprimer mon compte'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
