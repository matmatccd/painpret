import { MapPin, Star, Timer } from 'lucide-react'
import { bakery } from '../data/bakery'
import boutique from '../assets/photos/boutique.jpg'

// Bannière d'accueil de La Pétrie — éditoriale, posée, chaleureuse.
export default function Hero() {
  return (
    <section className="mx-auto w-full max-w-6xl animate-fade-up px-4 pt-6">
      <div className="relative overflow-hidden rounded-2xl border border-sand">
        {/* Vraie photo de la boutique La Pétrie */}
        <div className="relative flex min-h-[300px] flex-col justify-end p-7 sm:min-h-[380px] sm:p-10">
          <img
            src={boutique}
            alt="La boutique La Pétrie"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Voile sombre pour la lisibilité du texte */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

          {/* Badges d'état (sobres) */}
          <div className="relative mb-5 flex flex-wrap items-center gap-2">
            {bakery.ouvertMaintenant && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Ouvert maintenant
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25 backdrop-blur-sm">
              <Timer size={13} />
              Prêt en ~{bakery.tempsPreparation} min
            </span>
          </div>

          <div className="relative text-white">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#e9cd90]">
              Artisan boulanger · Click & Collect
            </p>
            <h1 className="text-4xl leading-none text-white sm:text-6xl">{bakery.nom}</h1>
            <p className="mt-3 max-w-md text-sm text-white/85 sm:text-base">
              {bakery.slogan} — {bakery.equipe}. Commandez ce qui est encore chaud,
              choisissez votre heure, et passez le récupérer sans faire la queue.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/90">
              <span className="inline-flex items-center gap-1.5">
                <Star size={15} className="fill-amber-300 text-amber-300" />
                <span className="font-semibold">{bakery.note.toFixed(1)}</span>
                <span className="text-white/65">({bakery.nombreAvis} avis)</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={15} />
                {bakery.adresse}, {bakery.ville}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
