import { useEffect, useRef, useState } from 'react'
import { ShoppingBag, CalendarClock, QrCode, HelpCircle, Wheat, Check } from 'lucide-react'

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

// Motif "QR code" décoratif (7×7) pour l'écran de l'étape 3
const MOTIF_QR = [
  1,1,1,0,1,1,1,
  1,0,1,0,1,0,1,
  1,1,1,0,1,1,1,
  0,0,0,1,0,0,0,
  1,1,0,1,0,1,1,
  1,0,1,0,1,0,1,
  1,1,1,0,1,1,1,
]

// --- Les 3 mini-écrans du téléphone (maquettes animées) ---
function EcranEtape({ etape }) {
  if (etape === 0) {
    // Étape 1 : la boutique — deux produits + panier
    return (
      <div key="e0" className="flex h-full animate-fade-up flex-col gap-2 p-3">
        <div className="flex items-center gap-1.5 rounded-lg bg-crust px-2.5 py-2">
          <Wheat size={11} className="text-[#e9cd90]" />
          <span className="text-[9px] font-bold text-white">PainPrêt</span>
        </div>
        {[
          { nom: 'La Pétrisane', prix: '1,35 €', delay: '80ms' },
          { nom: 'Pain complet', prix: '2,70 €', delay: '200ms' },
        ].map((p) => (
          <div
            key={p.nom}
            className="animate-fade-up rounded-lg border border-sand bg-white p-2"
            style={{ animationDelay: p.delay }}
          >
            <div className="h-8 rounded-md bg-gradient-to-br from-[#e9b872] to-[#c98a3a]" />
            <p className="mt-1.5 text-[8px] font-semibold text-ink">{p.nom}</p>
            <div className="flex items-center justify-between">
              <span className="text-[8px] font-bold text-ember">{p.prix}</span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-crust text-[8px] font-bold text-white">+</span>
            </div>
          </div>
        ))}
        <div
          className="mt-auto animate-fade-up rounded-lg bg-crust py-1.5 text-center text-[8px] font-bold text-white"
          style={{ animationDelay: '350ms' }}
        >
          Voir le panier · 4,05 €
        </div>
      </div>
    )
  }
  if (etape === 1) {
    // Étape 2 : le choix du créneau + paiement
    return (
      <div key="e1" className="flex h-full animate-fade-up flex-col gap-2 p-3">
        <p className="text-[9px] font-bold text-ink">Votre heure de retrait</p>
        <div className="grid grid-cols-2 gap-1.5">
          {['07:30', '07:45', '08:00', '08:15'].map((h, i) => (
            <div
              key={h}
              className={`animate-fade-up rounded-md py-1.5 text-center text-[8px] font-semibold ${
                i === 1 ? 'bg-crust text-white' : 'border border-sand bg-white text-ink'
              }`}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              {i === 1 && <Check size={8} className="mr-0.5 inline" />}
              {h}
            </div>
          ))}
        </div>
        <div
          className="mt-auto animate-fade-up space-y-1.5"
          style={{ animationDelay: '400ms' }}
        >
          <div className="flex items-center gap-1 rounded-md border border-sand bg-white px-2 py-1.5">
            <span className="h-2 w-3 rounded-sm bg-gradient-to-r from-[#9c3061] to-[#6b2a4e]" />
            <span className="text-[7px] text-stone-warm">•••• 4242</span>
          </div>
          <div className="rounded-lg bg-emerald-600 py-1.5 text-center text-[8px] font-bold text-white">
            Payer en ligne · 4,05 €
          </div>
        </div>
      </div>
    )
  }
  // Étape 3 : le QR code au comptoir
  return (
    <div key="e2" className="flex h-full animate-fade-up flex-col items-center justify-center gap-2 p-3">
      <span className="animate-fade-up rounded-full bg-emerald-100 px-2 py-0.5 text-[8px] font-bold text-emerald-700">
        Commande prête !
      </span>
      <div
        className="animate-fade-up grid grid-cols-7 gap-[2px] rounded-lg border border-sand bg-white p-2"
        style={{ animationDelay: '150ms' }}
      >
        {MOTIF_QR.map((v, i) => (
          <span key={i} className={`h-[7px] w-[7px] rounded-[1px] ${v ? 'bg-ink' : 'bg-transparent'}`} />
        ))}
      </div>
      <p className="animate-fade-up font-display text-sm text-ink" style={{ animationDelay: '250ms' }}>
        #B12
      </p>
      <p className="animate-fade-up text-center text-[8px] text-stone-warm" style={{ animationDelay: '350ms' }}>
        Montrez ce code au comptoir
      </p>
    </div>
  )
}

// Section "Comment ça marche" : une démo 3D animée (téléphone qui pivote,
// écrans qui s'enchaînent en boucle) + les 3 étapes cliquables à côté.
export default function CommentCaMarche({ onFAQ }) {
  const ref = useRef(null)
  const [vu, setVu] = useState(false)
  const [etape, setEtape] = useState(0)

  // Démarre quand la section entre dans l'écran
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

  // La démo avance toute seule (3,5 s par étape, en boucle).
  // Toucher une étape la sélectionne et relance le minuteur.
  useEffect(() => {
    if (!vu) return
    const t = setInterval(() => setEtape((e) => (e + 1) % ETAPES.length), 3500)
    return () => clearInterval(t)
  }, [vu, etape])

  return (
    <section ref={ref} className="mx-auto w-full max-w-6xl px-4 py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">Simple et rapide</p>
        <h2 className="mt-1 text-2xl text-ink sm:text-3xl">Comment ça marche ?</h2>
        <span className="filet-titre" aria-hidden="true" />
      </header>

      <div className="grid items-center gap-10 lg:grid-cols-2">
        {/* --- La démo : téléphone 3D animé --- */}
        <div className="scene-3d flex flex-col items-center">
          <div className="tel-3d relative w-[190px]">
            {/* Coque du téléphone */}
            <div className="rounded-[1.8rem] border border-ink/15 bg-ink p-2 shadow-[0_24px_50px_-20px_rgba(51,34,42,0.5)]">
              {/* Encoche */}
              <div className="absolute left-1/2 top-3.5 z-10 h-1.5 w-14 -translate-x-1/2 rounded-full bg-black/60" />
              {/* Écran */}
              <div className="h-[330px] overflow-hidden rounded-[1.35rem] bg-cream pt-4">
                <EcranEtape etape={etape} />
              </div>
            </div>
          </div>
          {/* Ombre au sol qui suit la rotation */}
          <div className="tel-ombre mt-5 h-3 w-36 rounded-[100%] bg-ink/30 blur-md" />

          {/* Points d'avancement de la démo */}
          <div className="mt-4 flex gap-1.5">
            {ETAPES.map((e, i) => (
              <button
                key={e.titre}
                type="button"
                onClick={() => setEtape(i)}
                aria-label={`Étape ${i + 1} : ${e.titre}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === etape ? 'w-6 bg-crust' : 'w-2 bg-sand hover:bg-crust/40'
                }`}
              />
            ))}
          </div>
        </div>

        {/* --- Les 3 étapes, synchronisées avec la démo --- */}
        <div className="space-y-3">
          {ETAPES.map((e, i) => {
            const Icone = e.icone
            const active = i === etape
            return (
              <button
                key={e.titre}
                type="button"
                onClick={() => setEtape(i)}
                className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all duration-300 ${
                  active
                    ? 'border-crust/40 bg-paper shadow-[0_14px_32px_-18px_rgba(111,47,67,0.45)]'
                    : 'border-sand bg-paper/60 opacity-70 hover:opacity-100'
                }`}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
                    active ? 'bg-crust text-white' : 'bg-cream text-crust ring-1 ring-sand'
                  }`}
                >
                  <Icone size={20} />
                </span>
                <span>
                  <span className="flex items-center gap-2">
                    <span className={`font-display text-lg transition-colors ${active ? 'text-ember' : 'text-sand'}`}>
                      0{i + 1}
                    </span>
                    <span className="font-sans text-[15px] font-semibold text-ink">{e.titre}</span>
                  </span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-stone-warm">{e.texte}</span>
                </span>
              </button>
            )
          })}

          <button
            type="button"
            onClick={onFAQ}
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-crust transition-colors hover:text-ember"
          >
            <HelpCircle size={15} /> Des questions ? Consultez la FAQ →
          </button>
        </div>
      </div>
    </section>
  )
}
