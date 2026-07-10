import { useMemo, useState } from 'react'
import { ArrowLeft, Clock, CreditCard, Check, User, Ban, Mail } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useShop } from '../context/ShopContext'
import { genererCreneaux, formatHeure } from '../lib/creneaux'
import { formatPrix } from '../lib/format'

const MOYENS_PAIEMENT = [
  { id: 'cb', label: 'Carte bancaire' },
  { id: 'apple', label: 'Apple Pay' },
  { id: 'google', label: 'Google Pay' },
]

// Étape de retrait : récap + choix du créneau + paiement (simulé).
export default function PickupSlots({ onRetour, onConfirme }) {
  const { lignes, total, viderPanier } = useCart()
  const { ajouterCommande, boutiqueFermee } = useShop()

  // Le prénom et l'email du client — mémorisés pour les prochaines commandes
  const [prenom, setPrenom] = useState(() => localStorage.getItem('painpret_prenom') || '')
  const [email, setEmail] = useState(() => localStorage.getItem('painpret_email') || '')
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [erreur, setErreur] = useState('')

  // Le délai de prépa = le plus long parmi les produits du panier
  const delaiMax = useMemo(
    () => Math.max(10, ...lignes.map((l) => l.produit.delaiPreparation || 10)),
    [lignes],
  )
  const creneaux = useMemo(() => genererCreneaux(delaiMax), [delaiMax])

  const [creneauChoisi, setCreneauChoisi] = useState(null)
  const [paiement, setPaiement] = useState('cb')

  async function confirmer() {
    if (!creneauChoisi || boutiqueFermee || envoiEnCours) return
    setErreur('')
    localStorage.setItem('painpret_prenom', prenom.trim())
    localStorage.setItem('painpret_email', email.trim())

    // On transforme les lignes du panier en articles lisibles pour le boulanger.
    // "produitId" permet de décompter le stock au moment de la commande.
    // "remarque" = la demande du client (ex : bien cuit) que le boulanger verra.
    const articles = lignes.map((l) => ({
      produitId: l.produit.id,
      nom: l.varianteNom ? `${l.produit.nom} (${l.varianteNom})` : l.produit.nom,
      quantite: l.quantite,
      prix: l.prixUnitaire, // prix unitaire, pour le reçu imprimé
      remarque: l.remarque || '',
    }))

    setEnvoiEnCours(true)
    try {
      const commande = await ajouterCommande({
        articles,
        total,
        client: prenom.trim(),
        email: email.trim(),
        creneau: creneauChoisi.label === 'Dès que possible'
          ? formatHeure(creneauChoisi.date)
          : creneauChoisi.label,
        heureRetrait: creneauChoisi.date.toISOString(),
      })
      viderPanier()
      onConfirme(commande)
    } catch (e) {
      // Messages clairs pour le client selon la raison
      if (/boutique_fermee/.test(e.message)) {
        setErreur('La boutique vient de fermer : commande impossible pour le moment.')
      } else if (/stock_insuffisant/.test(e.message)) {
        const nom = e.message.split(':')[1]?.trim()
        setErreur(`Désolé, « ${nom || 'un produit'} » vient d'être épuisé. Ajustez votre panier.`)
      } else {
        setErreur('Un souci est survenu. Réessayez dans un instant.')
      }
      setEnvoiEnCours(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-up px-4 py-6">
      <button
        type="button"
        onClick={onRetour}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-warm transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} /> Retour à la boutique
      </button>

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">Retrait — mode Drive</p>
      <h1 className="mt-1 text-3xl text-ink sm:text-4xl">Finaliser ma commande</h1>

      {/* Boutique fermée exceptionnellement : on ne prend plus de commandes */}
      {boutiqueFermee && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200">
          <Ban size={20} className="mt-0.5 shrink-0 text-rose-600" />
          <div>
            <p className="font-semibold text-rose-700">La boutique est exceptionnellement fermée</p>
            <p className="mt-0.5 text-sm text-rose-600">
              Les commandes en ligne sont suspendues pour le moment. Revenez un peu plus tard — merci de votre compréhension !
            </p>
          </div>
        </div>
      )}

      {/* Prénom : le boulanger appelle "Commande pour Julie !" */}
      <section className="mt-6">
        <label htmlFor="prenom" className="flex items-center gap-2 text-lg text-ink">
          <User size={18} className="text-crust" /> Votre prénom
        </label>
        <input
          id="prenom"
          type="text"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          placeholder="Ex : Julie"
          autoComplete="given-name"
          className="mt-3 w-full rounded-xl border border-sand bg-paper px-4 py-3 text-sm outline-none transition placeholder:text-stone-warm/70 focus:border-crust focus:ring-2 focus:ring-crust/15"
        />
        <p className="mt-1.5 text-xs text-stone-warm">
          Il sera affiché au boulanger pour vous appeler quand c'est prêt.
        </p>

        {/* Email : pour recevoir la confirmation et retrouver son QR Code */}
        <label htmlFor="email" className="mt-4 flex items-center gap-2 text-lg text-ink">
          <Mail size={18} className="text-crust" /> Votre email
          <span className="text-sm font-normal text-stone-warm">(facultatif)</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ex : julie@email.com"
          autoComplete="email"
          className="mt-3 w-full rounded-xl border border-sand bg-paper px-4 py-3 text-sm outline-none transition placeholder:text-stone-warm/70 focus:border-crust focus:ring-2 focus:ring-crust/15"
        />
        <p className="mt-1.5 text-xs text-stone-warm">
          Pour recevoir votre confirmation et retrouver votre QR Code si vous l'oubliez.
        </p>
      </section>

      {/* Récapitulatif */}
      <section className="mt-6 rounded-2xl border border-sand bg-paper p-5">
        <h2 className="text-lg text-ink">Votre commande</h2>
        <ul className="mt-3 space-y-2">
          {lignes.map((l) => (
            <li key={l.cle} className="flex justify-between gap-3 text-sm">
              <span className="text-ink">
                <span className="tnum font-semibold text-stone-warm">{l.quantite}×</span>{' '}
                {l.produit.nom}
                {l.varianteNom && <span className="text-stone-warm"> · {l.varianteNom}</span>}
              </span>
              <span className="price font-semibold text-ink">
                {formatPrix(l.prixUnitaire * l.quantite)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-sand pt-3">
          <span className="font-semibold text-ink">Total</span>
          <span className="price text-lg font-bold text-ember">{formatPrix(total)}</span>
        </div>
      </section>

      {/* Créneaux */}
      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-lg text-ink">
          <Clock size={18} className="text-crust" /> Choisissez votre heure de retrait
        </h2>
        {/* Plus de créneaux = la boutique est fermée pour aujourd'hui */}
        {creneaux.length === 0 && (
          <p className="mt-3 rounded-xl border border-dashed border-sand bg-paper px-4 py-5 text-center text-sm text-stone-warm">
            La boutique est fermée pour aujourd'hui — les commandes reprennent demain dès l'ouverture.
          </p>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {creneaux.map((c) => {
            const choisi = creneauChoisi?.id === c.id
            return (
              <button
                key={c.id}
                type="button"
                disabled={c.complet}
                onClick={() => setCreneauChoisi(c)}
                className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                  c.complet
                    ? 'cursor-not-allowed border-sand bg-cream text-stone-warm/50'
                    : choisi
                      ? 'border-crust bg-crust text-white'
                      : 'border-sand bg-paper text-ink hover:border-crust/40'
                }`}
              >
                <span className="block text-sm font-semibold">{c.label}</span>
                <span className={`block text-xs ${choisi ? 'text-white/80' : 'text-stone-warm'}`}>
                  {c.complet ? 'Complet' : c.detail || 'Disponible'}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Paiement */}
      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-lg text-ink">
          <CreditCard size={18} className="text-crust" /> Mode de paiement
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {MOYENS_PAIEMENT.map((m) => {
            const choisi = paiement === m.id
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setPaiement(m.id)}
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                  choisi ? 'border-crust bg-cream text-ink' : 'border-sand bg-paper text-stone-warm hover:border-crust/40'
                }`}
              >
                {m.label}
                {choisi && <Check size={16} className="text-crust" />}
              </button>
            )
          })}
        </div>
      </section>

      {/* Message d'erreur éventuel (stock épuisé, boutique fermée…) */}
      {erreur && (
        <p className="mt-6 rounded-xl bg-rose-50 px-4 py-3 text-center text-sm font-medium text-rose-700 ring-1 ring-rose-200">
          {erreur}
        </p>
      )}

      {/* Validation */}
      <button
        type="button"
        onClick={confirmer}
        disabled={!creneauChoisi || boutiqueFermee || envoiEnCours}
        className="mt-7 w-full rounded-xl bg-crust py-4 font-semibold text-white transition-colors hover:bg-crust-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-sand disabled:text-stone-warm"
      >
        {boutiqueFermee
          ? 'Boutique fermée — commandes suspendues'
          : envoiEnCours
            ? 'Validation en cours…'
            : creneauChoisi
              ? `Payer et confirmer · ${formatPrix(total)}`
              : 'Choisissez un créneau'}
      </button>
      <p className="mt-3 text-center text-xs text-stone-warm">
        Démonstration — aucun paiement réel n'est encore encaissé.
      </p>
    </div>
  )
}
