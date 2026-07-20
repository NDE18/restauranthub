export default function LegalPage() {
  return (
    <div className="container py-12 max-w-3xl mx-auto prose prose-gray">
      <h1 className="text-3xl font-bold mb-8">Mentions légales</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Éditeur du site</h2>
        <p className="text-gray-600">
          <strong>RestaurantHub SAS</strong><br />
          42 rue de la Paix, 75001 Paris<br />
          Capital social : 10 000 €<br />
          RCS Paris : 123 456 789<br />
          TVA intracommunautaire : FR12 123456789<br />
          Email : contact@restauranthub.fr<br />
          Téléphone : +33 1 23 45 67 89
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Directeur de la publication</h2>
        <p className="text-gray-600">Jean Dupont, Président de RestaurantHub SAS</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Hébergement</h2>
        <p className="text-gray-600">
          Ce site est hébergé par :<br />
          <strong>Amazon Web Services EMEA SARL</strong><br />
          38 avenue John F. Kennedy, L-1855 Luxembourg
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Propriété intellectuelle</h2>
        <p className="text-gray-600">
          L'ensemble du contenu de ce site (textes, images, graphismes, logos, icônes, sons, logiciels...) est la propriété exclusive de RestaurantHub SAS ou de ses partenaires. Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments du site est strictement interdite sans l'accord écrit préalable de RestaurantHub SAS.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Limitation de responsabilité</h2>
        <p className="text-gray-600">
          RestaurantHub SAS s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur ce site. Cependant, RestaurantHub SAS ne peut garantir l'exactitude, la précision ou l'exhaustivité des informations mises à disposition sur ce site.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Cookies</h2>
        <p className="text-gray-600">
          Ce site utilise des cookies techniques nécessaires à son fonctionnement. En naviguant sur ce site, vous acceptez l'utilisation de ces cookies. Pour en savoir plus, consultez notre{' '}
          <a href="/politique-confidentialite" className="text-orange-500 hover:underline">politique de confidentialité</a>.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Droit applicable</h2>
        <p className="text-gray-600">
          Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français seront seuls compétents.
        </p>
      </section>
    </div>
  )
}
