import { Plus, Check, Timer, Heart } from 'lucide-react'
import { useState } from 'react'
import { formatPrix } from '../lib/format'
import { useCart } from '../context/CartContext'

// Carte d'un produit. Interaction volontairement sobre :
// - pas de "tout qui décolle au survol" (le réflexe qui fait too-much)
// - juste un léger changement de bordure/ombre, et un feedback de pression
export default function ProductCard({ produit, onOpen, index = 0, favori = false, onToggleFavori }) {
  const { ajouter } = useCart()
  const [ajoute, setAjoute] = useState(false)
  const epuise = !produit.disponible

  function ajouterAuPanier(e) {
    e.stopPropagation()
    if (epuise) return
    ajouter(produit, { quantite: 1 })
    setAjoute(true)
    setTimeout(() => setAjoute(false), 1000)
  }

  // Ouverture au clic ou au clavier (Entrée / Espace)
  function ouvrir() {
    onOpen?.(produit)
  }
  function surTouche(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      ouvrir()
    }
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={ouvrir}
      onKeyDown={surTouche}
      aria-label={`Voir ${produit.nom}, ${formatPrix(produit.prix)}`}
      // Entrée en cascade discrète (30–50 ms par carte), plafonnée
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
      className="group flex animate-fade-up cursor-pointer flex-col overflow-hidden rounded-xl border border-sand bg-paper transition-[border-color,box-shadow] duration-200 hover:border-crust/40 hover:shadow-[0_10px_28px_-14px_rgba(111,47,67,0.35)]"
    >
      {/* Vignette produit : photo si disponible, sinon dégradé + emoji */}
      <div
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden"
        style={produit.image ? { background: '#ffffff' } : { background: `linear-gradient(150deg, ${produit.from}, ${produit.to})` }}
      >
        {produit.image ? (
          <img
            src={produit.image}
            alt={produit.nom}
            loading="lazy"
            className={`h-full w-full object-contain p-3 transition-transform duration-300 ease-out group-hover:scale-[1.06] ${epuise ? 'opacity-40 grayscale' : ''}`}
          />
        ) : (
          <span className={`text-5xl ${epuise ? 'opacity-40 grayscale' : ''}`}>{produit.emoji}</span>
        )}
        {/* léger voile pour un rendu "photographié", moins criard */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

        {epuise && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-1.5 text-center text-xs font-semibold uppercase tracking-widest text-white">
            Épuisé aujourd'hui
          </span>
        )}

        {produit.nouveau && !epuise && (
          <span className="absolute left-3 top-3 rounded-full bg-paper/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-crust">
            Nouveau
          </span>
        )}

        {/* Cœur "favori" (mémorisé sur l'appareil) */}
        {onToggleFavori && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavori(produit.id)
            }}
            aria-label={favori ? `Retirer ${produit.nom} des favoris` : `Ajouter ${produit.nom} aux favoris`}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-paper/95 shadow-sm transition-transform active:scale-90"
          >
            <Heart size={15} className={favori ? 'fill-ember text-ember' : 'text-stone-warm'} />
          </button>
        )}

        {/* Bouton d'ajout : feedback de pression (scale), pas d'agitation au survol */}
        {!epuise && (
          <button
            type="button"
            onClick={ajouterAuPanier}
            aria-label={`Ajouter ${produit.nom} au panier`}
            className={`absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full shadow-sm transition active:scale-90 ${
              ajoute ? 'bg-emerald-600 text-white' : 'bg-paper text-crust hover:bg-crust hover:text-white'
            }`}
          >
            {ajoute ? <Check size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={2.5} />}
          </button>
        )}
      </div>

      {/* Infos */}
      <div className="flex flex-1 flex-col px-4 py-3">
        {produit.sousCategorie && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ember">
            {produit.sousCategorie}
          </p>
        )}
        <h3 className="mt-0.5 font-sans text-[15px] font-semibold leading-snug text-ink">
          {produit.nom}
        </h3>
        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-stone-warm">
          {produit.description}
        </p>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <span className="price text-[15px] font-bold text-ember">
            {formatPrix(produit.prix)}
          </span>
          {produit.delaiPreparation && !epuise && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-stone-warm">
              <Timer size={12} /> ~{produit.delaiPreparation} min
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
