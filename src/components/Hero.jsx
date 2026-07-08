import { useEffect, useState } from 'react'
import { MapPin, Star, Timer, Navigation } from 'lucide-react'
import { bakery, lienItineraire } from '../data/bakery'
import boutique from '../assets/photos/boutique.jpg'
import fournil from '../assets/photos/fournil.jpg'

// Photos du diaporama — il suffit d'ajouter une ligne pour une nouvelle photo
// (ex : le portrait de Sandra & Johnatan quand il sera prêt).
const PHOTOS = [
  { src: boutique, alt: 'La boutique La Pétrie' },
  { src: fournil, alt: 'Le fournil de La Pétrie' },
]

// Bannière d'accueil : diaporama automatique des photos de la boulangerie.
export default function Hero() {
  const [index, setIndex] = useState(0)

  // Défilement automatique toutes les 5 s — sauf si l'utilisateur
  // a demandé à réduire les animations (accessibilité).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (PHOTOS.length < 2) return
    const minuteur = setInterval(() => {
      setIndex((i) => (i + 1) % PHOTOS.length)
    }, 5000)
    return () => clearInterval(minuteur)
  }, [])

  return (
    <section className="mx-auto w-full max-w-6xl animate-fade-up px-4 pt-6">
      <div className="relative overflow-hidden rounded-2xl border border-sand">
        <div className="relative flex min-h-[300px] flex-col justify-end p-7 sm:min-h-[380px] sm:p-10">
          {/* Les photos, empilées : seule celle d'index visible (fondu doux) */}
          {PHOTOS.map((photo, i) => (
            <img
              key={photo.src}
              src={photo.src}
              alt={i === index ? photo.alt : ''}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                i === index ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}

          {/* Voile prune (couleurs de la devanture) pour la lisibilité */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2c1019]/85 via-[#2c1019]/35 to-[#2c1019]/15" />

          {/* Badges d'état */}
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
              {/* Itinéraire pour ceux qui ne connaissent pas la boutique */}
              <a
                href={lienItineraire}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-crust transition-colors hover:bg-[#f2d3d8]"
              >
                <Navigation size={13} /> Itinéraire
              </a>
            </div>
          </div>

          {/* Points du diaporama (cliquables) */}
          {PHOTOS.length > 1 && (
            <div className="absolute bottom-4 right-5 flex gap-1.5">
              {PHOTOS.map((photo, i) => (
                <button
                  key={photo.src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Photo ${i + 1} : ${photo.alt}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index ? 'w-5 bg-white' : 'w-2 bg-white/45 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
