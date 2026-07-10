import { ArrowLeft, ChevronDown, Navigation } from 'lucide-react'
import { bakery, lienItineraire } from '../data/bakery'

// Questions / réponses. Faciles à modifier : une entrée = une question.
const QUESTIONS = [
  {
    q: 'Comment passer commande ?',
    r: 'Choisissez vos pains dans la boutique en ligne, ajoutez-les au panier, sélectionnez votre heure de retrait et payez en ligne. Votre QR Code de retrait s’affiche immédiatement.',
  },
  {
    q: 'Quand est-ce que je paie ?',
    r: 'Le paiement se fait en ligne au moment de la commande (carte bancaire, Apple Pay ou Google Pay). Rien à régler en boutique : vous montrez votre QR Code et vous repartez.',
  },
  {
    q: 'Où et comment récupérer ma commande ?',
    r: `En boutique, au ${bakery.adresse} à ${bakery.ville.replace(/^\d+\s*/, '')}. Présentez simplement le QR Code reçu à la commande : moins d’une minute et c’est réglé.`,
    itineraire: true,
  },
  {
    q: 'J’ai perdu mon QR Code, que faire ?',
    r: 'Touchez l’icône horloge en haut du site (« Mes commandes ») : vous y retrouvez vos commandes en cours et pouvez réafficher votre QR Code à tout moment.',
  },
  {
    q: 'Puis-je modifier ou annuler ma commande ?',
    r: `Pour l’instant, appelez directement la boutique au ${bakery.telephone} ou passez au comptoir : l’équipe trouvera toujours une solution.`,
  },
  {
    q: 'Comment contacter la boutique ?',
    r: `Par téléphone au ${bakery.telephone}, ou directement en boutique au ${bakery.adresse} à ${bakery.ville.replace(/^\d+\s*/, '')}.`,
  },
  {
    q: 'Et si un produit est épuisé ?',
    r: 'La disponibilité est en temps réel : un produit épuisé est signalé et ne peut plus être commandé. Les fournées suivantes le remettent en ligne dans la journée.',
  },
  {
    q: 'Quels sont les horaires ?',
    r: null, // rendu spécial : le tableau des horaires
  },
  {
    q: 'Le pain est-il fabriqué sur place ?',
    r: `Oui ! Tout est pétri et cuit sur place dans notre fournil, par ${bakery.equipe}, artisans boulangers depuis 2012.`,
  },
]

// Page FAQ : accordéon simple (une question ouverte à la fois via <details>).
export default function Faq({ onRetour }) {
  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-up px-4 py-6">
      <button
        type="button"
        onClick={onRetour}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-warm transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} /> Retour à la boutique
      </button>

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">On vous répond</p>
      <h1 className="mt-1 text-3xl text-ink sm:text-4xl">Questions fréquentes</h1>

      <div className="mt-6 space-y-2.5">
        {QUESTIONS.map((item) => (
          <details
            key={item.q}
            className="group rounded-xl border border-sand bg-paper open:border-crust/40"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 font-semibold text-ink [&::-webkit-details-marker]:hidden">
              {item.q}
              <ChevronDown
                size={18}
                className="shrink-0 text-stone-warm transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="border-t border-sand-soft px-4 py-3.5 text-sm leading-relaxed text-stone-warm">
              {item.r ?? (
                // Cas spécial : les horaires, générés depuis les données
                <>
                  <ul className="space-y-1">
                    {bakery.horaires.map((h) => (
                      <li key={h.jour} className="flex justify-between gap-4">
                        <span className="font-medium text-ink">{h.jour}</span>
                        <span className="tnum">{h.heures}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 rounded-lg bg-cream px-3 py-2 text-xs font-medium text-crust ring-1 ring-sand">
                    {bakery.noteFermeture}.
                  </p>
                </>
              )}
              {item.itineraire && (
                <a
                  href={lienItineraire}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-crust px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-crust-dark"
                >
                  <Navigation size={14} /> Itinéraire vers la boutique
                </a>
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
