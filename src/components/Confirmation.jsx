import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle2, Clock, Store, Navigation } from 'lucide-react'
import { formatPrix } from '../lib/format'
import { lienItineraire } from '../data/bakery'
import { useShop } from '../context/ShopContext'
import { useNotifications } from '../context/NotificationsContext'

// Calcule le temps restant (en secondes) avant l'heure de retrait
function secondesRestantes(heureISO) {
  return Math.round((new Date(heureISO).getTime() - Date.now()) / 1000)
}

// Écran de confirmation : numéro, QR Code, heure de retrait, minuteur.
export default function Confirmation({ commande, onTermine }) {
  const { commandes, signalerArrivee } = useShop()
  const { ajouterNotification } = useNotifications()
  // Version "vivante" de la commande (pour voir l'état "arrivé" à jour)
  const live = commandes.find((c) => c.id === commande.id) ?? commande

  const [restant, setRestant] = useState(() => secondesRestantes(commande.heureRetrait))

  function jeSuisArrive() {
    signalerArrivee(commande.id)
    ajouterNotification('👋 Le boulanger est prévenu de votre arrivée.')
  }

  // Minuteur : on met à jour chaque seconde
  useEffect(() => {
    const minuteur = setInterval(() => {
      setRestant(secondesRestantes(commande.heureRetrait))
    }, 1000)
    return () => clearInterval(minuteur)
  }, [commande.heureRetrait])

  const heure = new Date(commande.heureRetrait).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // Mise en forme du minuteur : "12 min" ou "C'est prêt !"
  let texteMinuteur
  if (restant <= 0) {
    texteMinuteur = 'C’est bientôt prêt !'
  } else if (restant < 60) {
    texteMinuteur = `${restant} s`
  } else {
    const min = Math.floor(restant / 60)
    texteMinuteur = `${min} min`
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="animate-pop-in rounded-2xl border border-sand bg-paper p-7 text-center">
        {/* Confirmation */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
          <CheckCircle2 size={30} className="text-emerald-600" />
        </div>
        <h1 className="mt-4 text-2xl text-ink sm:text-3xl">Commande confirmée</h1>
        <p className="mt-1 text-sm text-stone-warm">
          Présentez ce QR Code en boutique pour récupérer votre commande.
        </p>

        {/* Numéro de commande */}
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-cream px-4 py-1.5 ring-1 ring-sand">
          <span className="text-xs font-medium uppercase tracking-wide text-stone-warm">
            Commande
          </span>
          <span className="font-display text-lg text-ink">#{commande.numero}</span>
        </div>

        {/* QR Code */}
        <div className="mt-6 flex justify-center">
          <div className="rounded-2xl border border-sand bg-white p-4">
            <QRCodeSVG
              value={`PAINPRET|${commande.numero}|${heure}`}
              size={168}
              fgColor="#2e211a"
              bgColor="#ffffff"
              level="M"
            />
          </div>
        </div>

        {/* Heure de retrait + minuteur */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-sand bg-cream p-3">
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-stone-warm">
              <Store size={13} /> Retrait
            </div>
            <p className="mt-1 font-display text-xl text-ink">{heure}</p>
          </div>
          <div className="rounded-xl border border-sand bg-cream p-3">
            <div className="flex items-center justify-center gap-1.5 text-xs font-medium text-stone-warm">
              <Clock size={13} /> Dans
            </div>
            <p className="mt-1 font-display text-xl text-crust">{texteMinuteur}</p>
          </div>
        </div>

        {/* Itinéraire vers la boutique */}
        <a
          href={lienItineraire}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-crust hover:underline"
        >
          <Navigation size={15} /> Itinéraire vers la boutique
        </a>

        {/* Total */}
        <div className="mt-5 flex items-center justify-between border-t border-sand pt-4 text-left">
          <span className="text-sm text-stone-warm">
            {commande.articles.reduce((n, a) => n + a.quantite, 0)} article(s)
          </span>
          <span className="price font-bold text-ink">{formatPrix(commande.total)}</span>
        </div>

        {/* Signaler son arrivée (le boulanger voit un badge "Client sur place") */}
        {live.arrive ? (
          <p className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 size={17} /> Le boulanger est prévenu de votre arrivée
          </p>
        ) : (
          <button
            type="button"
            onClick={jeSuisArrive}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-crust py-3.5 font-semibold text-white transition-colors hover:bg-crust-dark active:scale-[0.99]"
          >
            <Store size={18} />
            Je suis arrivé
          </button>
        )}

        <button
          type="button"
          onClick={onTermine}
          className="mt-3 w-full rounded-xl border border-sand bg-cream py-3 font-semibold text-ink transition-colors hover:border-crust/40"
        >
          Revenir à la boutique
        </button>
      </div>
    </div>
  )
}
