import { useEffect, useState } from 'react'
import { MapPin, Star, Timer, Navigation, CheckCircle2, QrCode } from 'lucide-react'
import { bakery, lienItineraire, estOuvertMaintenant } from '../data/bakery'
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
  // Accroche affichée sous le nom (elle change toute seule)
  const [accroche, setAccroche] = useState(0)

  // Défilement automatique toutes les 5 s.
  // (Si l'utilisateur a réduit les animations, seul le fondu est coupé
  //  par le CSS — le contenu continue de changer.)
  useEffect(() => {
    if (PHOTOS.length < 2) return
    const minuteur = setInterval(() => {
      setIndex((i) => (i + 1) % PHOTOS.length)
    }, 5000)
    return () => clearInterval(minuteur)
  }, [])

  // Les accroches défilent un peu plus vite (toutes les 3,5 s)
  useEffect(() => {
    if (bakery.accroches.length < 2) return
    const t = setInterval(() => {
      setAccroche((i) => (i + 1) % bakery.accroches.length)
    }, 3500)
    return () => clearInterval(t)
  }, [])

  return (
    // Bannière pleine largeur : la photo couvre l'écran bord à bord,
    // sans cadre ni espaces blancs autour.
    <section className="animate-fade-up">
      <div className="relative overflow-hidden">
        <div className="relative flex min-h-[340px] flex-col justify-end sm:min-h-[440px]">
          {/* Les photos, empilées : seule celle d'index visible (fondu doux) */}
          {PHOTOS.map((photo, i) => (
            <img
              key={photo.src}
              src={photo.src}
              alt={i === index ? photo.alt : ''}
              className={`hero-photo absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                i === index ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}

          {/* Voile léger : sombre seulement derrière le texte (en bas),
              pour que les photos restent bien visibles en haut */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#291022]/85 via-[#291022]/30 to-transparent" />

          {/* Cartes flottantes (grand écran) : elles lévitent au-dessus de la photo,
              comme le téléphone de la démo — un aperçu vivant du service */}
          <div className="pointer-events-none absolute right-10 top-16 z-10 hidden lg:block" aria-hidden="true">
            <div className="carte-flotte flex items-center gap-2.5 rounded-2xl bg-white/95 px-4 py-3 shadow-[0_18px_40px_-16px_rgba(20,8,12,0.5)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 size={18} className="text-emerald-600" />
              </span>
              <span>
                <span className="block text-sm font-bold text-ink">Commande #B12 prête !</span>
                <span className="block text-xs text-stone-warm">Encore chaude, elle vous attend</span>
              </span>
            </div>
            <div className="carte-flotte-2 ml-16 mt-4 flex items-center gap-2.5 rounded-2xl bg-white/95 px-4 py-3 shadow-[0_18px_40px_-16px_rgba(20,8,12,0.5)]">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream ring-1 ring-sand">
                <QrCode size={17} className="text-crust" />
              </span>
              <span>
                <span className="block text-sm font-bold text-ink">Scanné en 1 seconde</span>
                <span className="block text-xs text-stone-warm">Zéro attente au comptoir</span>
              </span>
            </div>
          </div>

          {/* Contenu centré (la photo, elle, couvre tout l'écran) */}
          <div className="relative mx-auto w-full max-w-6xl px-5 pb-8 pt-20 sm:px-6 sm:pb-10">
          {/* Badges d'état */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {estOuvertMaintenant() ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25">
                {/* La pastille verte pulse doucement : la boutique vit */}
                <span className="relative flex h-1.5 w-1.5">
                  <span className="pastille-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Ouvert maintenant
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                Fermé — réouvre bientôt
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/25">
              <Timer size={13} />
              Prêt en ~{bakery.tempsPreparation} min
            </span>
          </div>

          <div className="text-white">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#e9cd90]">
              Click &amp; Collect · {bakery.ville.replace(/^\d+\s*/, '')}
            </p>
            <h1 className="text-4xl leading-none text-white [text-shadow:0_2px_20px_rgba(20,8,12,0.6)] sm:text-6xl">{bakery.nom}</h1>
            {/* Accroche qui défile (change toute seule, en fondu) */}
            <p className="mt-3 min-h-7">
              <span key={accroche} className="animate-avis inline-block font-display text-lg text-[#f4dfc0] [text-shadow:0_1px_10px_rgba(20,8,12,0.55)] sm:text-xl">
                {bakery.accroches[accroche]}
              </span>
            </p>
            <p className="mt-2 max-w-lg text-sm text-white/90 [text-shadow:0_1px_10px_rgba(20,8,12,0.5)] sm:text-base">
              {bakery.equipe}. {bakery.description}
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
