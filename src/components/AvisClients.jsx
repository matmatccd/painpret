import { Star } from 'lucide-react'
import { bakery, avisClients } from '../data/bakery'

// Étoiles pleines/vides selon la note (sur 5)
function Etoiles({ note }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${note} sur 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={15}
          className={n <= note ? 'fill-amber-400 text-amber-400' : 'text-sand'}
        />
      ))}
    </span>
  )
}

// Vrais avis clients de La Pétrie (relevés sur sa fiche publique).
export default function AvisClients() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">
            Ils en parlent mieux que nous
          </p>
          <h2 className="mt-1 text-2xl text-ink sm:text-3xl">Vos avis</h2>
        </div>
        <p className="inline-flex items-center gap-1.5 text-sm text-stone-warm">
          <Star size={16} className="fill-amber-400 text-amber-400" />
          <span className="font-semibold text-ink">{bakery.note.toFixed(1).replace('.', ',')}</span>
          / 5 · {bakery.nombreAvis} avis
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {avisClients.map((avis) => (
          <figure
            key={avis.auteur}
            className="flex flex-col gap-3 rounded-2xl border border-sand bg-paper p-5"
          >
            <Etoiles note={avis.note} />
            <blockquote className="flex-1 text-sm leading-relaxed text-ink">
              « {avis.texte} »
            </blockquote>
            <figcaption className="text-xs font-semibold uppercase tracking-wide text-stone-warm">
              — {avis.auteur}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
