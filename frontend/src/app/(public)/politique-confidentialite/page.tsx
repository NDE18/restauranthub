export default function PrivacyPage() {
  return (
    <div className="container py-12 max-w-3xl mx-auto prose prose-gray">
      <h1 className="text-3xl font-bold mb-2">Politique de confidentialité</h1>
      <p className="text-gray-500 mb-8">Dernière mise à jour : 1er janvier 2025</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Responsable du traitement</h2>
        <p className="text-gray-600">
          RestaurantHub SAS, 42 rue de la Paix, 75001 Paris — contact@restauranthub.fr est responsable du traitement de vos données personnelles.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Données collectées</h2>
        <p className="text-gray-600 mb-2">Nous collectons les données suivantes :</p>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Données d'identification (nom, prénom, email, téléphone)</li>
          <li>Données de connexion (adresse IP, logs d'accès)</li>
          <li>Données de commandes et réservations</li>
          <li>Données de géolocalisation (lors de la livraison, avec votre consentement)</li>
          <li>Données de paiement (traitées par Stripe — nous ne stockons pas vos coordonnées bancaires)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Finalités du traitement</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Exécution des commandes et réservations (base légale : contrat)</li>
          <li>Gestion de votre compte client (base légale : contrat)</li>
          <li>Programme de fidélité (base légale : consentement)</li>
          <li>Amélioration de nos services (base légale : intérêt légitime)</li>
          <li>Obligations légales et comptables (base légale : obligation légale)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Durée de conservation</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Données de compte : 3 ans après la dernière activité</li>
          <li>Données de commandes : 5 ans (obligations comptables)</li>
          <li>Logs de connexion : 1 an</li>
          <li>Données de paiement : selon les obligations légales en vigueur</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Destinataires des données</h2>
        <p className="text-gray-600">
          Vos données peuvent être partagées avec :
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-1 mt-2">
          <li>Nos partenaires restaurants (pour l'exécution de vos commandes)</li>
          <li>Nos prestataires de paiement (Stripe)</li>
          <li>Nos services de notification (SendGrid, Twilio)</li>
          <li>Les autorités compétentes si requis par la loi</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Vos droits</h2>
        <p className="text-gray-600 mb-2">
          Conformément au RGPD, vous disposez des droits suivants :
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
          <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
          <li><strong>Droit à l'effacement</strong> : supprimer vos données ("droit à l'oubli")</li>
          <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré</li>
          <li><strong>Droit d'opposition</strong> : vous opposer à certains traitements</li>
          <li><strong>Droit à la limitation</strong> : limiter le traitement de vos données</li>
        </ul>
        <p className="text-gray-600 mt-3">
          Pour exercer ces droits, rendez-vous dans votre espace client → "Mes données" ou contactez-nous à{' '}
          <a href="mailto:dpo@restauranthub.fr" className="text-orange-500 hover:underline">dpo@restauranthub.fr</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Cookies</h2>
        <p className="text-gray-600">
          Nous utilisons uniquement des cookies techniques strictement nécessaires au fonctionnement du service (session, authentification, préférences). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">8. Réclamations</h2>
        <p className="text-gray-600">
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la{' '}
          <strong>CNIL</strong> (Commission Nationale de l'Informatique et des Libertés) :{' '}
          <a href="https://www.cnil.fr" className="text-orange-500 hover:underline" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
        </p>
      </section>
    </div>
  )
}
