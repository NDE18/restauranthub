import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🍽️</span>
            <span className="font-bold text-lg">Saveurs</span>
          </div>
          <p className="text-sm text-gray-500">
            Votre plateforme de restauration premium. Réservez, commandez, savourez.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Découvrir</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><Link href="/restaurants" className="hover:text-gray-900">Nos restaurants</Link></li>
            <li><Link href="/commande" className="hover:text-gray-900">Commander</Link></li>
            <li><Link href="/restaurants?service=livraison" className="hover:text-gray-900">Livraison</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Mon compte</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><Link href="/auth/inscription" className="hover:text-gray-900">Créer un compte</Link></li>
            <li><Link href="/mon-compte/reservations" className="hover:text-gray-900">Mes réservations</Link></li>
            <li><Link href="/mon-compte/commandes" className="hover:text-gray-900">Mes commandes</Link></li>
            <li><Link href="/mon-compte/fidelite" className="hover:text-gray-900">Programme fidélité</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3 text-sm">Informations</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li><Link href="/mentions-legales" className="hover:text-gray-900">Mentions légales</Link></li>
            <li><Link href="/politique-confidentialite" className="hover:text-gray-900">Confidentialité</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t py-4">
        <div className="container flex flex-col md:flex-row justify-between items-center text-xs text-gray-400 gap-2">
          <span>© {new Date().getFullYear()} Saveurs. Tous droits réservés.</span>
          <span>Fait avec ❤️ en France</span>
        </div>
      </div>
    </footer>
  )
}
