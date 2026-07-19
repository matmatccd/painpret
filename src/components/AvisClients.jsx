import { useEffect, useState } from 'react'
import { Star, Quote } from 'lucide-react'
import { bakery, avisClients, lienAvisGoogle } from '../data/bakery'

// Étoiles pleines/vides selon la note (sur 5).
// "animees" : elles se remplissent une à une, comme si on notait en direct.
function Etoiles({ note, clair = false, animees = false }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${note} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={16}
          style={animees && n <= note ? { animationDelay: `${n * 110}ms` } : undefined}
          className={`${animees && n <= note ? 'etoile-pop ' : ''}${
            n <= note ? 'fill-amber-300 text-amber-300' : clair ? 'text-white/30' : 'text-sand'
          }`}
        />
      ))}
    </span>
  )
}

// Avis clients de La Pétrie, en diaporama, posés sur un flux de couleurs animé.
export default function AvisClients() {
  const [index, setIndex] = useState(0)

  // Défilement automatique. (Le réglage "réduire les animations" coupe
  // seulement le fondu via le CSS — les avis continuent de changer.)
  useEffect(() => {
    if (avisClients.length < 2) return
    const t = setInterval(() => setIndex((i) => (i + 1) % avisClients.length), 5000)
    return () => clearInterval(t)
  }, [])

  const avis = avisClients[index]

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <div className="relative overflow-hidden rounded-3xl">
        {/* Flux de couleurs qui bouge, aux teintes de la façade */}
        <div className="flux-petrie absolute inset-0" />
        {/* Léger voile pour la lisibilité du texte */}
        <div className="absolute inset-0 bg-[#291022]/25" />

        <div className="relative px-6 py-10 sm:px-12 sm:py-14 text-white">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#e9cd90]">
                Ils en parlent mieux que nous
              </p>
              <h2 className="mt-1 text-2xl text-white sm:text-3xl">Vos avis</h2>
            </div>
            <p className="inline-flex items-center gap-1.5 text-sm text-white/85">
              <Star size={16} className="fill-amber-300 text-amber-300" />
              <span className="font-semibold text-white">
                {bakery.note.toFixed(1).replace('.', ',')}
              </span>
              / 5 · {bakery.nombreAvis} avis
            </p>
          </div>

          {/* L'avis courant (change en fondu) */}
          <figure key={index} className="animate-avis min-h-[7.5rem] max-w-2xl">
            <Quote size={30} className="mb-2 text-[#e9cd90]" />
            <Etoiles note={avis.note} clair animees />
            <blockquote className="mt-3 font-display text-xl leading-snug text-white sm:text-2xl">
              « {avis.texte} »
            </blockquote>
            <figcaption className="mt-3 text-sm font-semibold uppercase tracking-wide text-white/75">
              — {avis.auteur}
            </figcaption>
          </figure>

          {/* Points du diaporama (cliquables) + lien avis Google */}
          <div className="mt-7 flex items-center justify-between gap-4">
            <div className="flex gap-1.5">
              {avisClients.map((a, i) => (
                <button
                  key={a.auteur}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Avis ${i + 1} sur ${avisClients.length}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
            <a
              href={lienAvisGoogle}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-full bg-white/20 px-4 py-2 text-xs font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/25"
            >
              Laisser un avis
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
