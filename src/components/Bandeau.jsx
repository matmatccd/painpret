import { Wheat, Flame, Clock, MapPin } from 'lucide-react'
import { bakery } from '../data/bakery'

// Bandeau de réassurance façon "enseigne" : fond prune animé (le flux de
// couleurs de la devanture), icônes dorées qui flottent doucement, et un
// reflet lumineux qui balaye le bandeau. Chic et vivant, sans défilement.
const ATOUTS = [
  { Icone: Wheat, titre: 'Pain frais du jour', sous: 'Fait maison' },
  { Icone: Flame, titre: 'Cuit sur place', sous: 'Devant vous' },
  { Icone: Clock, titre: `Prêt en ~${bakery.tempsPreparation} min`, sous: 'Sans attente' },
  { Icone: MapPin, titre: 'Retrait à Reims', sous: '164 av. Jean Jaurès' },
]

export default function Bandeau() {
  return (
    // Collé directement sous la bannière photo : aucun espace blanc entre les deux.
    <section className="relative overflow-hidden">
      {/* Fond : flux de couleurs de la façade + léger assombrissement */}
      <div className="flux-petrie absolute inset-0" />
      <div className="absolute inset-0 bg-[#291022]/30" />
      {/* Reflet doré qui balaye le bandeau */}
      <div className="bandeau-reflet" />
      {/* Filets dorés fins, comme sur la devanture */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e9cd90]/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#e9cd90]/70 to-transparent" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-2 gap-x-3 gap-y-5 px-4 py-5 sm:grid-cols-4 sm:gap-0">
        {ATOUTS.map(({ Icone, titre, sous }, i) => (
          <div key={titre} className="flex items-center gap-3 sm:justify-center">
            <span
              className="bandeau-icone flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-[#e9cd90] shadow-[0_4px_14px_-6px_rgba(0,0,0,0.45)] ring-1 ring-[#e9cd90]/45 backdrop-blur-sm"
              style={{ animationDelay: `${i * 0.45}s` }}
            >
              <Icone size={18} strokeWidth={1.75} />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-[13px] font-semibold text-white [text-shadow:0_1px_6px_rgba(20,8,12,0.4)]">
                {titre}
              </p>
              <p className="truncate text-[11px] text-[#f2d3d8]/85">{sous}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
