import { MapPin, Clock, Navigation, HelpCircle } from 'lucide-react'
import { bakery, lienItineraire } from '../data/bakery'
import Logo from './Logo'

// Pied de page aux couleurs de la devanture : fond prune, filet doré,
// slogan rose poudré — comme l'enseigne de La Pétrie.
export default function Footer({ onFAQ }) {
  // Horaires du jour : getDay() renvoie 0 pour dimanche, notre tableau commence lundi
  const jourJS = new Date().getDay()
  const aujourdHui = bakery.horaires[jourJS === 0 ? 6 : jourJS - 1]

  return (
    <footer className="mt-10 border-t-2 border-[#e9cd90]/60 bg-crust text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Logo taille="sm" clair />
          <p className="mt-2 font-display text-lg text-[#f2d3d8]">
            Commandez. Passez. Repartez.
          </p>
        </div>

        <div className="space-y-2 text-sm text-white/80">
          <p className="flex items-start gap-1.5">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            <span>{bakery.nom} · {bakery.equipe} — {bakery.adresse}, {bakery.ville}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <Clock size={16} className="shrink-0" />
            <span>Aujourd'hui ({aujourdHui.jour.toLowerCase()}) : {aujourdHui.heures}</span>
          </p>

          {/* Liens utiles */}
          <div className="flex flex-wrap gap-2 pt-2">
            <a
              href={lienItineraire}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-2 text-xs font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/20"
            >
              <Navigation size={14} /> Itinéraire
            </a>
            <button
              type="button"
              onClick={onFAQ}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-2 text-xs font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/20"
            >
              <HelpCircle size={14} /> Questions fréquentes
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-white/15">
        <p className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-white/55">
          © {new Date().getFullYear()} PainPrêt. Démonstration — aucune commande réelle.
        </p>
      </div>
    </footer>
  )
}
