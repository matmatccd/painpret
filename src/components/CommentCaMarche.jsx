import { useEffect, useRef, useState } from 'react'
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
// Les étapes apparaissent en cascade quand la section entre dans l'écran,
// reliées par un trait doré qui se dessine.
export default function CommentCaMarche({ onFAQ }) {
  const ref = useRef(null)
  const [vu, setVu] = useState(false)

  useEffect(() => {
    if (vu || !ref.current || typeof IntersectionObserver === 'undefined') {
      if (typeof IntersectionObserver === 'undefined') setVu(true)
      return
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVu(true)
          obs.disconnect()
        }
      },
      { threshold: 0.2 },
    )
    obs.observe(ref.current)
    return () => obs.disconnect()
  }, [vu])

  return (
    <section ref={ref} className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">Simple et rapide</p>
        <h2 className="mt-1 text-2xl text-ink sm:text-3xl">Comment ça marche ?</h2>
      </header>

      <div className="relative grid gap-4 sm:grid-cols-3">
        {/* Trait doré reliant les 3 étapes (desktop), qui se dessine à l'apparition */}
        <div
          className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-9 hidden h-px origin-left bg-gradient-to-r from-gilt/50 via-gilt/50 to-gilt/50 transition-transform duration-[900ms] ease-out sm:block"
          style={{ transform: vu ? 'scaleX(1)' : 'scaleX(0)' }}
          aria-hidden="true"
        />
        {ETAPES.map((etape, i) => {
          const Icone = etape.icone
          return (
            <div
              key={etape.titre}
              className="group relative rounded-xl border border-sand bg-paper p-5 shadow-sm transition-[border-color,box-shadow,transform,opacity] duration-500 ease-out hover:-translate-y-1 hover:border-crust/40 hover:shadow-[0_16px_36px_-18px_rgba(111,47,67,0.45)]"
              style={{
                transitionDelay: `${vu ? i * 140 : 0}ms`,
                opacity: vu ? 1 : 0,
                transform: vu ? 'translateY(0)' : 'translateY(24px)',
              }}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-crust text-white shadow-sm transition-colors duration-200 group-hover:bg-ember">
                  <Icone size={20} className="transition-transform duration-300 group-hover:scale-110" />
                </span>
                <span className="font-display text-2xl text-sand transition-colors duration-200 group-hover:text-ember/60">
                  0{i + 1}
                </span>
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
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-crust transition-colors hover:text-ember"
      >
        <HelpCircle size={15} /> Des questions ? Consultez la FAQ →
      </button>
    </section>
  )
}
