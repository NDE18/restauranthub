import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Saveurs — Réservation & Commande', template: '%s | Saveurs' },
  description: 'Réservez une table, commandez en Click & Collect ou faites-vous livrer dans les meilleurs restaurants.',
  keywords: ['restaurant', 'réservation', 'livraison', 'click and collect'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
