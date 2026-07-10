import { Wheat } from 'lucide-react'

// Messages du bandeau
const MESSAGES = [
  'Pain frais du jour',
  'Fait maison',
  'Cuit sur place, devant vous',
  'Artisan boulanger depuis 2012',
  'Commandez, passez, repartez',
]

// Ruban élégant entre le Hero et la boutique : flux bordeaux très lent,
// petites capitales espacées, fins épis dorés en séparateurs.
// Le contenu est affiché deux fois pour une boucle sans couture
// (la seconde copie est masquée aux lecteurs d'écran).
export default function Bandeau() {
  const Serie = ({ cache = false }) => (
    <div className="flex items-center" aria-hidden={cache || undefined}>
      {MESSAGES.map((m) => (
        <span key={m} className="flex items-center">
          <span className="whitespace-nowrap px-8 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f2d3d8]/90 sm:text-xs">
            {m}
          </span>
          <Wheat size={12} className="shrink-0 text-[#e9cd90]/45" />
        </span>
      ))}
    </div>
  )

  return (
    <div className="relative mt-6 overflow-hidden border-y border-[#e9cd90]/30 py-3">
      {/* Flux bordeaux, très lent, légèrement assombri */}
      <div className="flux-petrie absolute inset-0" />
      <div className="absolute inset-0 bg-[#2c1019]/35" />
      <div className="marquee-petrie relative">
        <Serie />
        <Serie cache />
      </div>
    </div>
  )
}
