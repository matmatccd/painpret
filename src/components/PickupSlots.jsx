import { useMemo, useState } from 'react'
import { ArrowLeft, Clock, CreditCard, Check, User, Ban, Lock } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useShop } from '../context/ShopContext'
import { joursDisponibles, formatHeure } from '../lib/creneaux'
import { surchargeProduit } from '../lib/charge'
import { formatPrix } from '../lib/format'
import { creerPaiement } from '../lib/stripe'

// Étape de retrait : récap + coordonnées + créneau + PAIEMENT EN LIGNE (Stripe).
export default function PickupSlots({ onRetour }) {
  const { lignes, total } = useCart()
  const { boutiqueFermee, commandes, pauseJusqua } = useShop()

  // Coordonnées du client (obligatoires) — mémorisées pour les prochaines fois
  const [prenom, setPrenom] = useState(() => localStorage.getItem('painpret_prenom') || '')
  const [nom, setNom] = useState(() => localStorage.getItem('painpret_nom') || '')
  const [telephone, setTelephone] = useState(() => localStorage.getItem('painpret_tel') || '')
  const [email, setEmail] = useState(() => localStorage.getItem('painpret_email') || '')
  const [envoiEnCours, setEnvoiEnCours] = useState(false)
  const [erreur, setErreur] = useState('')

  // Validation simple des coordonnées obligatoires
  const emailValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const telValide = telephone.replace(/[^0-9+]/g, '').length >= 10
  const coordonneesOk = prenom.trim() && nom.trim() && telValide && emailValide
  const champCoord =
    'w-full rounded-xl border border-sand bg-paper px-4 py-3 text-sm outline-none transition placeholder:text-stone-warm/70 focus:border-crust focus:ring-2 focus:ring-crust/15'

  // Le délai de prépa = le plus long parmi les produits du panier,
  // ALLONGÉ automatiquement si le fournil est très demandé en ce moment
  // (beaucoup de commandes en attente sur les mêmes produits).
  const { delaiMax, minutesSurcharge, minutesPause } = useMemo(() => {
    const delaiBase = Math.max(10, ...lignes.map((l) => l.produit.delaiPreparation || 10))
    const delaiCharge = Math.max(
      10,
      ...lignes.map(
        (l) => (l.produit.delaiPreparation || 10) + surchargeProduit(l.produit.id, commandes),
      ),
    )
    // Pause du fournil : on ajoute le temps de pause restant
    const finPause = pauseJusqua ? new Date(pauseJusqua).getTime() : 0
    const pause = Math.max(0, Math.ceil((finPause - Date.now()) / 60000))
    return {
      delaiMax: delaiCharge + pause,
      minutesSurcharge: delaiCharge - delaiBase,
      minutesPause: pause,
    }
  }, [lignes, commandes, pauseJusqua])
  // Les jours proposés (aujourd'hui + jours d'ouverture suivants),
  // chacun avec ses créneaux — les quarts d'heure trop chargés sont "Complet".
  const jours = useMemo(() => joursDisponibles(delaiMax, commandes), [delaiMax, commandes])
  const [offsetJour, setOffsetJour] = useState(null) // null = premier jour dispo
  const jourActif = jours.find((j) => j.offset === offsetJour) ?? jours[0] ?? null
  const creneaux = jourActif?.creneaux ?? []

  const [creneauChoisi, setCreneauChoisi] = useState(null)

  async function confirmer() {
    if (!creneauChoisi || boutiqueFermee || envoiEnCours) return
    if (!coordonneesOk) {
      setErreur('Merci de renseigner votre prénom, nom, téléphone et email.')
      return
    }
    setErreur('')
    localStorage.setItem('painpret_prenom', prenom.trim())
    localStorage.setItem('painpret_nom', nom.trim())
    localStorage.setItem('painpret_tel', telephone.trim())
    localStorage.setItem('painpret_email', email.trim())

    // On transforme les lignes du panier en articles lisibles pour le boulanger.
    const articles = lignes.map((l) => ({
      produitId: l.produit.id,
      nom: l.varianteNom ? `${l.produit.nom} (${l.varianteNom})` : l.produit.nom,
      quantite: l.quantite,
      prix: l.prixUnitaire,
      remarque: l.remarque || '',
    }))

    // Le créneau enregistré garde le jour si le retrait n'est pas aujourd'hui
    // (ex : "Demain 07:15") pour que le boulanger s'y retrouve.
    const heure = creneauChoisi.label === 'Dès que possible'
      ? formatHeure(creneauChoisi.date)
      : creneauChoisi.label
    const creneau = creneauChoisi.jourLabel
      ? `${creneauChoisi.jourLabel.charAt(0).toUpperCase() + creneauChoisi.jourLabel.slice(1)} ${heure}`
      : heure

    setEnvoiEnCours(true)
    try {
      // La commande est envoyée au serveur puis créée après le paiement réussi
      const url = await creerPaiement({
        articles,
        total,
        client: `${prenom.trim()} ${nom.trim()}`.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
        creneau,
        heureRetrait: creneauChoisi.date.toISOString(),
      })
      window.location.href = url // redirection vers la page de paiement Stripe
    } catch (e) {
      setErreur('Le paiement n’a pas pu démarrer. Réessayez dans un instant.')
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

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">Commande en ligne · Retrait en boutique</p>
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

      {/* Coordonnées obligatoires pour retirer et payer la commande */}
      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-lg text-ink">
          <User size={18} className="text-crust" /> Vos coordonnées
        </h2>
        <p className="mt-1 text-xs text-stone-warm">
          Obligatoires pour préparer et vous remettre votre commande.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            aria-label="Prénom"
            type="text"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            placeholder="Prénom *"
            autoComplete="given-name"
            className={champCoord}
          />
          <input
            aria-label="Nom"
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom *"
            autoComplete="family-name"
            className={champCoord}
          />
          <input
            aria-label="Téléphone"
            type="tel"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="Téléphone *"
            autoComplete="tel"
            inputMode="tel"
            className={champCoord}
          />
          <input
            aria-label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email *"
            autoComplete="email"
            inputMode="email"
            className={champCoord}
          />
        </div>
        <p className="mt-1.5 text-xs text-stone-warm">
          Le boulanger pourra vous contacter par téléphone en cas de besoin sur votre commande.
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
        {/* Le fournil est en pause : les créneaux sont décalés le temps de souffler */}
        {minutesPause > 0 && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-cream px-4 py-3 text-sm text-stone-warm ring-1 ring-sand">
            <Clock size={16} className="mt-0.5 shrink-0 text-crust" />
            <span>
              Le fournil fait une courte pause — les premiers créneaux sont décalés d'environ{' '}
              <span className="font-semibold text-ink">{minutesPause} min</span>. Merci de votre
              patience !
            </span>
          </p>
        )}
        {/* Forte demande : le délai s'est allongé pour laisser le temps au fournil */}
        {minutesSurcharge > 0 && (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
            <Clock size={16} className="mt-0.5 shrink-0" />
            <span>
              Beaucoup de commandes en ce moment : le fournil a besoin d'environ{' '}
              <span className="font-semibold">{minutesSurcharge} min de plus</span> pour préparer
              la vôtre. Les créneaux en tiennent compte.
            </span>
          </p>
        )}
        {/* Boutique fermée en ce moment : on commande pour un prochain jour */}
        {jours.length > 0 && jours[0].offset > 0 && (
          <p className="mt-3 rounded-xl bg-cream px-4 py-3 text-sm text-stone-warm ring-1 ring-sand">
            La boutique est fermée pour le moment — commandez dès maintenant pour{' '}
            <span className="font-semibold text-ink">{jours[0].libelle.toLowerCase()}</span> :
          </p>
        )}
        {/* Aucun créneau du tout (cas exceptionnel) */}
        {jours.length === 0 && (
          <p className="mt-3 rounded-xl border border-dashed border-sand bg-paper px-4 py-5 text-center text-sm text-stone-warm">
            Aucun créneau disponible pour le moment — revenez un peu plus tard.
          </p>
        )}

        {/* Choix du JOUR de retrait (précommande possible) */}
        {jours.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {jours.map((j) => {
              const actif = j.offset === (jourActif?.offset ?? -1)
              return (
                <button
                  key={j.offset}
                  type="button"
                  onClick={() => {
                    setOffsetJour(j.offset)
                    setCreneauChoisi(null)
                  }}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold capitalize transition-colors ${
                    actif
                      ? 'border-crust bg-crust text-white'
                      : 'border-sand bg-paper text-stone-warm hover:border-crust/40 hover:text-ink'
                  }`}
                >
                  {j.libelle}
                </button>
              )
            })}
          </div>
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

      {/* Chacun son tour : commander en ligne ne donne aucune priorité */}
      <aside className="mt-6 flex items-start gap-4 rounded-2xl border border-sand bg-gradient-to-br from-paper to-cream p-4">
        {/* Petite file animée : trois pains avancent sagement vers le comptoir */}
        <span className="mt-1 flex shrink-0 items-center gap-1" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="file-pain h-2.5 w-4 rounded-full bg-gradient-to-br from-[#e9b872] to-[#c98a3a]"
              style={{ animationDelay: `${(2 - i) * 0.35}s` }}
            />
          ))}
          <span className="ml-1 h-4 w-1.5 rounded-sm bg-crust" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">Chacun son tour !</p>
          <p className="mt-0.5 text-sm leading-relaxed text-stone-warm">
            Commander en ligne, c'est pratique — mais ça ne fait doubler personne. Votre commande
            prend sa place dans la file du fournil, comme au comptoir, et le créneau proposé en
            tient déjà compte. Merci de votre patience !
          </p>
        </div>
      </aside>

      {/* Paiement en ligne sécurisé (Stripe) */}
      <section className="mt-6">
        <h2 className="flex items-center gap-2 text-lg text-ink">
          <CreditCard size={18} className="text-crust" /> Paiement en ligne
        </h2>
        <div className="mt-3 flex items-start gap-3 rounded-xl border border-sand bg-paper p-4">
          <Lock size={18} className="mt-0.5 shrink-0 text-emerald-600" />
          <p className="text-sm text-stone-warm">
            Réglez par carte sur une page <span className="font-semibold text-ink">sécurisée Stripe</span>.
            Votre commande est enregistrée dès que le paiement est validé.
          </p>
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
        disabled={!creneauChoisi || boutiqueFermee || envoiEnCours || !coordonneesOk}
        className={`mt-7 w-full rounded-xl bg-crust py-4 font-semibold text-white transition-colors hover:bg-crust-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-sand disabled:text-stone-warm ${
          creneauChoisi && !boutiqueFermee && !envoiEnCours && coordonneesOk ? 'bouton-brillant' : ''
        }`}
      >
        {boutiqueFermee
          ? 'Boutique fermée — commandes suspendues'
          : envoiEnCours
            ? 'Redirection vers le paiement…'
            : !creneauChoisi
              ? 'Choisissez un créneau'
              : !coordonneesOk
                ? 'Remplissez vos coordonnées'
                : `Payer en ligne · ${formatPrix(total)}`}
      </button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-stone-warm">
        <Lock size={12} /> Paiement sécurisé par Stripe · Retrait en boutique
      </p>
    </div>
  )
}
