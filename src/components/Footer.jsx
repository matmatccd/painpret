import { MapPin, Clock } from 'lucide-react'
import { bakery } from '../data/bakery'
import Logo from './Logo'

// Pied de page : marque, adresse et horaires du jour.
// (L'accès boulanger se fait depuis l'icône boutique de l'en-tête, ou via #pro.)
export default function Footer() {
  // Horaires du jour : getDay() renvoie 0 pour dimanche, notre tableau commence lundi
  const jourJS = new Date().getDay()
  const aujourdHui = bakery.horaires[jourJS === 0 ? 6 : jourJS - 1]

  return (
    <footer className="mt-10 border-t border-sand bg-paper">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Logo taille="sm" />
          <p className="mt-2 font-display text-lg text-ember">Commandez. Passez. Repartez.</p>
        </div>

        <div className="space-y-2 text-sm text-stone-warm">
          <p className="flex items-start gap-1.5">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            <span>{bakery.nom} · {bakery.equipe} — {bakery.adresse}, {bakery.ville}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Clock size={16} className="shrink-0" />
            <span>Aujourd'hui ({aujourdHui.jour.toLowerCase()}) : {aujourdHui.heures}</span>
          </p>
        </div>
      </div>

      <div className="border-t border-sand/60">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-stone-warm/80">
          © {new Date().getFullYear()} PainPrêt. Démonstration — aucune commande réelle.
        </p>
      </div>
    </footer>
  )
}
