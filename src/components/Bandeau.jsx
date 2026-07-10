import { Wheat } from 'lucide-react'

// Messages du bandeau (façade La Pétrie : prune + doré)
const MESSAGES = [
  'Pain frais du jour',
  'Fait maison',
  'Cuit sur place, devant vous',
  'Artisan boulanger depuis 2012',
  'Commandez, passez, repartez',
]

// Bandeau défilant en continu entre le Hero et la boutique.
// Le contenu est affiché deux fois pour une boucle sans couture
// (la seconde copie est masquée aux lecteurs d'écran).
export default function Bandeau() {
  const Serie = ({ cache = false }) => (
    <div className="flex items-center" aria-hidden={cache || undefined}>
      {MESSAGES.map((m) => (
        <span key={m} className="flex items-center">
          <span className="whitespace-nowrap px-6 font-display text-sm tracking-wide text-[#e9cd90] sm:text-base">
            {m}
          </span>
          <Wheat size={15} className="shrink-0 text-[#e9cd90]/60" />
        </span>
      ))}
    </div>
  )

  return (
    <div className="mt-6 overflow-hidden border-y-2 border-[#e9cd90]/50 bg-crust py-2.5">
      <div className="marquee-petrie">
        <Serie />
        <Serie cache />
      </div>
    </div>
  )
}
