import { ShoppingBag, CalendarClock, QrCode, HelpCircle } from 'lucide-react'

const ETAPES = [
  {
    icone: ShoppingBag,
    titre: 'Commandez en ligne',
    texte: 'Choisissez vos pains parmi ce qui est réellement disponible, encore chaud.',
  },
  {
    icone: CalendarClock,
    titre: 'Choisissez votre créneau',
    texte: 'Sélectionnez votre heure de retrait et payez en ligne. Zéro attente.',
  },
  {
    icone: QrCode,
    titre: 'Passez, repartez',
    texte: 'Montrez votre QR Code au comptoir : votre commande vous attend.',
  },
]

// Section "Comment ça marche" : le concept Click & Collect en 3 étapes.
export default function CommentCaMarche({ onFAQ }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">Simple et rapide</p>
        <h2 className="mt-1 text-2xl text-ink sm:text-3xl">Comment ça marche ?</h2>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {ETAPES.map((etape, i) => {
          const Icone = etape.icone
          return (
            <div
              key={etape.titre}
              className="group rounded-xl border border-sand bg-paper p-5 transition-[border-color,box-shadow] duration-200 hover:border-crust/40 hover:shadow-[0_10px_28px_-14px_rgba(111,47,67,0.35)]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-crust text-white transition-colors duration-200 group-hover:bg-ember">
                  <Icone size={20} />
                </span>
                <span className="font-display text-2xl text-sand transition-colors duration-200 group-hover:text-ember/60">0{i + 1}</span>
              </div>
              <h3 className="mt-3 font-sans text-[15px] font-semibold text-ink">{etape.titre}</h3>
              <p className="mt-1 text-sm leading-relaxed text-stone-warm">{etape.texte}</p>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={onFAQ}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-crust hover:underline"
      >
        <HelpCircle size={15} /> Des questions ? Consultez la FAQ →
      </button>
    </section>
  )
}
