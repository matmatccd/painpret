import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle2, Clock, Store, Navigation, Star, BellRing } from 'lucide-react'
import { formatPrix } from '../lib/format'
import { lienItineraire, lienAvisGoogle } from '../data/bakery'
import { activerNotifCommande, pushClientDisponible } from '../lib/notifClient'
import { useShop } from '../context/ShopContext'
import { useNotifications } from '../context/NotificationsContext'

// Petite pluie de confettis aux couleurs de la boutique (jouée une fois,
// à l'arrivée sur la confirmation — le moment de fête !)
const COULEURS_CONFETTI = ['#e9cd90', '#b98a2f', '#9c3061', '#6b2a4e', '#f2d3d8', '#34d399']
function Confettis() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-44" aria-hidden="true">
      {[...Array(14)].map((_, i) => (
        <span
          key={i}
          className="confetti absolute"
          style={{
            left: `${5 + i * 6.6}%`,
            background: COULEURS_CONFETTI[i % COULEURS_CONFETTI.length],
            width: i % 3 === 0 ? '10px' : '7px',
            height: i % 3 === 0 ? '5px' : '9px',
            '--cf-duree': `${2 + (i % 5) * 0.35}s`,
            '--cf-delai': `${(i % 7) * 0.12}s`,
          }}
        />
      ))}
    </div>
  )
}

// Calcule le temps restant (en secondes) avant l'heure de retrait.
// Renvoie null si l'heure n'est pas définie (créneau "dès que possible").
function secondesRestantes(heureISO) {
  const t = new Date(heureISO).getTime()
  if (!heureISO || Number.isNaN(t)) return null
  return Math.round((t - Date.now()) / 1000)
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
    ajouterNotification('Le boulanger est prévenu de votre arrivée.')
  }

  // "Me prévenir quand c'est prêt" : notification push, même appli fermée
  const [etatNotif, setEtatNotif] = useState('') // '' | 'encours' | 'ok' | 'refuse'
  async function activerAlerte() {
    setEtatNotif('encours')
    const resultat = await activerNotifCommande(commande.numero)
    setEtatNotif(resultat === 'ok' ? 'ok' : 'refuse')
    if (resultat === 'ok') {
      ajouterNotification('C’est noté ! Vous serez prévenu dès que votre commande est prête.')
    }
  }

  // Minuteur : on met à jour chaque seconde
  useEffect(() => {
    const minuteur = setInterval(() => {
      setRestant(secondesRestantes(commande.heureRetrait))
    }, 1000)
    return () => clearInterval(minuteur)
  }, [commande.heureRetrait])

  const heureValide = commande.heureRetrait && !Number.isNaN(new Date(commande.heureRetrait).getTime())
  const dateRetrait = heureValide ? new Date(commande.heureRetrait) : null
  const retraitAujourdhui = dateRetrait && dateRetrait.toDateString() === new Date().toDateString()
  // Aujourd'hui : "11:30". Précommande : le créneau complet ("Demain 07:15").
  const heure = heureValide
    ? retraitAujourdhui
      ? dateRetrait.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : commande.creneau ||
        dateRetrait.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : commande.creneau || 'Dès que possible'

  // Mise en forme du minuteur : secondes, minutes, heures ou jours selon l'attente
  const livree = live.statut === 'livree'
  let texteMinuteur
  if (livree) {
    texteMinuteur = 'Récupérée'
  } else if (restant === null || restant <= 0) {
    texteMinuteur = 'À récupérer'
  } else if (restant < 60) {
    texteMinuteur = `${restant} s`
  } else if (restant < 7200) {
    texteMinuteur = `${Math.floor(restant / 60)} min`
  } else if (restant < 86400) {
    texteMinuteur = `${Math.round(restant / 3600)} h`
  } else {
    const jours = Math.round(restant / 86400)
    texteMinuteur = `${jours} jour${jours > 1 ? 's' : ''}`
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="animate-pop-in relative overflow-hidden rounded-2xl border border-sand bg-paper p-7 text-center">
        {/* Confettis de célébration (seulement pour une commande fraîche) */}
        {!livree && <Confettis />}
        {/* Confirmation */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-1 ring-emerald-200">
          <CheckCircle2 size={30} className="text-emerald-600" />
        </div>
        <h1 className="mt-4 text-2xl text-ink sm:text-3xl">
          {livree ? 'Commande récupérée' : 'Commande confirmée'}
        </h1>
        <p className="mt-1 text-sm text-stone-warm">
          {livree
            ? 'Vous la retrouverez dans « Mes commandes ». Merci !'
            : 'Présentez ce QR Code en boutique pour récupérer votre commande.'}
        </p>

        {/* Commande remboursée par la boutique */}
        {live.remboursee && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">
            Commande remboursée — le montant repart sur votre carte (2 à 5 jours).
          </p>
        )}

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
              <Clock size={13} /> {livree ? 'Statut' : 'Retrait dans'}
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

        {/* Une fois le QR scanné par le boulanger, la commande est récupérée */}
        {livree ? (
          <p className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 size={17} /> Commande récupérée — merci et à bientôt !
          </p>
        ) : live.arrive ? (
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

        {/* Être prévenu quand la commande est prête (push, même appli fermée) */}
        {!livree && pushClientDisponible() && etatNotif !== 'ok' && (
          <button
            type="button"
            onClick={activerAlerte}
            disabled={etatNotif === 'encours'}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-sand bg-cream py-3 text-sm font-semibold text-ink transition-colors hover:border-crust/40 disabled:opacity-60"
          >
            <BellRing size={16} className="text-crust" />
            {etatNotif === 'encours' ? 'Activation…' : 'Me prévenir quand c’est prêt'}
          </button>
        )}
        {etatNotif === 'ok' && (
          <p className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <BellRing size={15} /> Vous serez prévenu dès que c'est prêt
          </p>
        )}
        {etatNotif === 'refuse' && (
          <p className="mt-2 text-xs text-stone-warm">
            Notifications indisponibles sur cet appareil (autorisez-les dans les réglages, ou
            installez l'appli sur l'écran d'accueil sur iPhone).
          </p>
        )}

        <button
          type="button"
          onClick={onTermine}
          className="mt-3 w-full rounded-xl border border-sand bg-cream py-3 font-semibold text-ink transition-colors hover:border-crust/40"
        >
          Revenir à la boutique
        </button>

        {/* Après la vente : inviter le client à laisser un avis Google */}
        <a
          href={lienAvisGoogle}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gilt hover:underline"
        >
          <Star size={15} className="fill-gilt" />
          Contents ? Laissez-nous un avis Google
        </a>
      </div>
    </div>
  )
}
