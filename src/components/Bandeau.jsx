import { Wheat, Flame, Clock, MapPin } from 'lucide-react'
import { bakery } from '../data/bakery'

// Bandeau de réassurance : les atouts de la boulangerie, sobre et élégant.
// (Remplace l'ancien marquee défilant en capitales, trop chargé.)
const ATOUTS = [
  { Icone: Wheat, titre: 'Pain frais du jour', sous: 'Fait maison' },
  { Icone: Flame, titre: 'Cuit sur place', sous: 'Devant vous' },
  { Icone: Clock, titre: `Prêt en ~${bakery.tempsPreparation} min`, sous: 'Sans attente' },
  { Icone: MapPin, titre: 'Retrait à Reims', sous: '164 av. Jean Jaurès' },
]

export default function Bandeau() {
  return (
    <section className="mt-6 border-y border-sand bg-gradient-to-b from-paper to-cream">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-3 gap-y-4 px-4 py-4 sm:grid-cols-4 sm:gap-0">
        {ATOUTS.map(({ Icone, titre, sous }) => (
          <div
            key={titre}
            className="group flex items-center gap-3 sm:justify-center"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-crust ring-1 ring-sand transition-colors group-hover:text-ember group-hover:ring-crust/30">
              <Icone size={17} strokeWidth={1.75} />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[13px] font-semibold text-ink">{titre}</p>
              <p className="truncate text-[11px] text-stone-warm">{sous}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
