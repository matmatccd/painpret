import { useState } from 'react'
import { ArrowLeft, Scale, FileText, ShieldCheck } from 'lucide-react'
import { bakery, legal } from '../data/bakery'

// Petit bloc « à compléter » mis en évidence tant que la vraie valeur
// n'a pas été saisie dans src/data/bakery.js.
function Valeur({ children }) {
  const vide = typeof children === 'string' && children.startsWith('[À COMPLÉTER')
  if (vide) {
    return (
      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[13px] font-medium text-amber-800 ring-1 ring-amber-300">
        {children}
      </span>
    )
  }
  return <span className="font-medium text-ink">{children}</span>
}

// Un paragraphe de section légale : titre + contenu.
function Bloc({ titre, children }) {
  return (
    <section className="mt-6">
      <h2 className="font-display text-lg text-ink">{titre}</h2>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-stone-warm">{children}</div>
    </section>
  )
}

const ONGLETS = [
  { cle: 'mentions', label: 'Mentions légales', icone: Scale },
  { cle: 'cgv', label: 'Conditions de vente', icone: FileText },
  { cle: 'confidentialite', label: 'Confidentialité', icone: ShieldCheck },
]

// Pages légales : mentions légales, CGV et politique de confidentialité (RGPD).
export default function PagesLegales({ onRetour, ongletInitial = 'mentions' }) {
  const [onglet, setOnglet] = useState(ongletInitial)
  const ville = bakery.ville.replace(/^\d+\s*/, '')

  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-up px-4 py-6">
      <button
        type="button"
        onClick={onRetour}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-warm transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} /> Retour à la boutique
      </button>

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">Informations légales</p>
      <h1 className="mt-1 text-3xl text-ink sm:text-4xl">Mentions & conditions</h1>
      <span className="filet-titre" aria-hidden="true" />

      {/* Onglets */}
      <div className="mt-5 flex flex-wrap gap-2">
        {ONGLETS.map(({ cle, label, icone: Icone }) => {
          const actif = onglet === cle
          return (
            <button
              key={cle}
              type="button"
              onClick={() => setOnglet(cle)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold ring-1 transition-colors ${
                actif
                  ? 'bg-crust text-white ring-crust'
                  : 'bg-paper text-stone-warm ring-sand hover:text-ink hover:ring-crust/40'
              }`}
            >
              <Icone size={14} /> {label}
            </button>
          )
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-sand bg-paper p-5 sm:p-6">
        {onglet === 'mentions' && (
          <>
            <Bloc titre="Éditeur du site">
              <p>
                Le site <strong>PainPrêt</strong> est édité par la boulangerie{' '}
                <strong>{bakery.nom}</strong> ({bakery.equipe}), <Valeur>{legal.formeJuridique}</Valeur>.
              </p>
              <p>
                Adresse : {bakery.adresse}, {bakery.ville}.<br />
                Téléphone : {bakery.telephone}.<br />
                E-mail : <Valeur>{legal.email}</Valeur>.
              </p>
              <p>
                SIRET : <Valeur>{legal.siret}</Valeur>.
                {legal.rcs ? <> RCS : <Valeur>{legal.rcs}</Valeur>.</> : null}
                {legal.tva ? <> N° TVA : <Valeur>{legal.tva}</Valeur>.</> : null}
              </p>
              <p>
                Directeur de la publication : <Valeur>{legal.responsable}</Valeur>.
              </p>
            </Bloc>

            <Bloc titre="Hébergement">
              <p>
                <strong>Site internet</strong> : GitHub, Inc., 88 Colin P. Kelly Jr. Street,
                San Francisco, CA 94107, États-Unis.
              </p>
              <p>
                <strong>Base de données</strong> (commandes, comptes) : Supabase, Inc. — serveurs
                situés dans l’Union européenne (Allemagne).
              </p>
              <p>
                <strong>Paiements</strong> : Stripe Payments Europe, Ltd — 1 Grand Canal Street
                Lower, Dublin, Irlande.
              </p>
            </Bloc>

            <Bloc titre="Propriété intellectuelle">
              <p>
                L’ensemble des contenus du site (textes, photographies, logo, mise en page) est la
                propriété de {bakery.nom}, sauf mention contraire. Toute reproduction sans
                autorisation est interdite.
              </p>
            </Bloc>

            <Bloc titre="Données personnelles">
              <p>
                Le traitement de vos données est détaillé dans l’onglet{' '}
                <button type="button" onClick={() => setOnglet('confidentialite')} className="font-semibold text-crust hover:underline">
                  Confidentialité
                </button>
                .
              </p>
            </Bloc>
          </>
        )}

        {onglet === 'cgv' && (
          <>
            <Bloc titre="1. Objet">
              <p>
                Les présentes conditions régissent la vente en ligne de produits de boulangerie et
                de boissons proposés par {bakery.nom}, avec <strong>retrait en boutique</strong>{' '}
                (« click &amp; collect »). Toute commande implique l’acceptation pleine et entière
                des présentes conditions.
              </p>
            </Bloc>

            <Bloc titre="2. Produits et disponibilité">
              <p>
                Les produits sont présentés avec leur description et leur prix. La disponibilité est
                affichée en temps réel ; un produit épuisé ne peut plus être commandé. Les
                photographies sont non contractuelles.
              </p>
            </Bloc>

            <Bloc titre="3. Prix">
              <p>
                Les prix sont indiqués en euros, toutes taxes comprises (TTC). Le prix applicable est
                celui affiché au moment de la validation de la commande. {bakery.nom} se réserve le
                droit de modifier ses prix à tout moment, sans effet sur les commandes déjà payées.
              </p>
            </Bloc>

            <Bloc titre="4. Commande">
              <p>
                Vous sélectionnez vos produits, choisissez un jour et un créneau de retrait, puis
                validez et payez. Un QR Code de retrait vous est alors délivré. La vente est ferme
                une fois le paiement encaissé.
              </p>
            </Bloc>

            <Bloc titre="5. Paiement">
              <p>
                Le paiement s’effectue exclusivement en ligne, par carte bancaire, via la plateforme
                sécurisée <strong>Stripe</strong>. {bakery.nom} n’a jamais accès à vos données
                bancaires. La commande n’est enregistrée qu’après confirmation du paiement.
              </p>
            </Bloc>

            <Bloc titre="6. Retrait en boutique">
              <p>
                Le retrait se fait à la boutique, {bakery.adresse} à {ville}, au créneau choisi, sur
                présentation du QR Code. S’agissant de produits frais, nous vous invitons à respecter
                l’heure de retrait indiquée. Une commande non retirée le jour prévu pourra ne pas
                être conservée ni remboursée, la fraîcheur des produits ne pouvant être garantie.
              </p>
            </Bloc>

            <Bloc titre="7. Droit de rétractation">
              <p>
                Conformément à l’article <strong>L.221-28, 3° et 4° du Code de la consommation</strong>,
                le droit de rétractation ne s’applique pas aux biens périssables ni aux denrées
                alimentaires. Les commandes de produits de boulangerie et de boissons ne peuvent donc
                pas faire l’objet d’une rétractation.
              </p>
            </Bloc>

            <Bloc titre="8. Annulation et remboursement">
              <p>
                Pour toute question, modification ou annulation, contactez la boutique au{' '}
                {bakery.telephone} ou présentez-vous au comptoir. En cas de nécessité (erreur,
                indisponibilité), {bakery.nom} pourra procéder au remboursement intégral sur votre
                carte bancaire.
              </p>
            </Bloc>

            <Bloc titre="9. Médiation de la consommation">
              <p>
                Conformément au Code de la consommation, en cas de litige non résolu, vous pouvez
                recourir gratuitement au médiateur de la consommation :{' '}
                <Valeur>{legal.mediateur}</Valeur>. Vous pouvez également utiliser la plateforme
                européenne de règlement des litiges :{' '}
                <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="font-semibold text-crust hover:underline">
                  ec.europa.eu/consumers/odr
                </a>
                .
              </p>
            </Bloc>

            <Bloc titre="10. Droit applicable">
              <p>
                Les présentes conditions sont soumises au droit français. À défaut d’accord amiable,
                les tribunaux français seront compétents.
              </p>
            </Bloc>
          </>
        )}

        {onglet === 'confidentialite' && (
          <>
            <Bloc titre="Responsable du traitement">
              <p>
                {bakery.nom}, {bakery.adresse}, {bakery.ville} — e-mail :{' '}
                <Valeur>{legal.email}</Valeur>, est responsable du traitement de vos données
                personnelles collectées sur ce site.
              </p>
            </Bloc>

            <Bloc titre="Données collectées">
              <p>Lorsque vous passez commande, nous collectons :</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>vos nom et prénom ;</li>
                <li>votre e-mail et votre numéro de téléphone ;</li>
                <li>le détail de votre commande et votre créneau de retrait.</li>
              </ul>
              <p>
                Vos données bancaires sont traitées directement par Stripe et ne sont{' '}
                <strong>jamais</strong> stockées par la boulangerie.
              </p>
            </Bloc>

            <Bloc titre="Pourquoi (finalités) et base légale">
              <ul className="ml-4 list-disc space-y-1">
                <li>préparer et gérer votre commande, vous contacter à son sujet — base : exécution du contrat ;</li>
                <li>vous prévenir quand votre commande est prête (notifications) — base : votre consentement ;</li>
                <li>respecter nos obligations comptables et légales — base : obligation légale.</li>
              </ul>
            </Bloc>

            <Bloc titre="Destinataires">
              <p>
                Vos données sont accessibles à l’équipe de la boulangerie et à nos prestataires
                techniques, uniquement pour les besoins du service : <strong>Supabase</strong>{' '}
                (hébergement de la base de données, Union européenne) et <strong>Stripe</strong>{' '}
                (paiement). Elles ne sont jamais vendues.
              </p>
            </Bloc>

            <Bloc titre="Durée de conservation">
              <p>
                Vos commandes sont conservées le temps nécessaire à leur gestion, puis pour la durée
                imposée par nos obligations légales et comptables. Les données ne servant plus sont
                ensuite supprimées.
              </p>
            </Bloc>

            <Bloc titre="Vos droits">
              <p>
                Vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition, de
                limitation et de portabilité de vos données. Pour les exercer, écrivez-nous à{' '}
                <Valeur>{legal.email}</Valeur> ou appelez le {bakery.telephone}.
              </p>
              <p>
                Vous pouvez aussi introduire une réclamation auprès de la CNIL :{' '}
                <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="font-semibold text-crust hover:underline">
                  www.cnil.fr
                </a>
                .
              </p>
            </Bloc>

            <Bloc titre="Cookies et stockage local">
              <p>
                Ce site n’utilise <strong>aucun cookie publicitaire ni traceur tiers</strong>. Il
                enregistre seulement, dans votre navigateur, ce qui est nécessaire à son
                fonctionnement : votre panier, vos favoris, votre historique de commandes et votre
                choix de thème (clair/sombre). Les notifications ne sont activées qu’avec votre
                accord.
              </p>
            </Bloc>
          </>
        )}

        <p className="mt-8 border-t border-sand-soft pt-4 text-xs text-stone-warm">
          Dernière mise à jour : {legal.miseAJour}.
        </p>
      </div>
    </div>
  )
}
