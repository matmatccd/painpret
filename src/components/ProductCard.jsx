import { Plus, Check, Timer, Heart } from 'lucide-react'
import { useState } from 'react'
import { formatPrix } from '../lib/format'
import { useCart } from '../context/CartContext'
import { volerVersPanier } from '../lib/volAuPanier'

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
    // La photo du produit s'envole vers le panier de l'en-tête
    const photo = e.currentTarget.closest('article')?.querySelector('img')
    if (photo) volerVersPanier(photo)
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
      className="group carte-3d flex animate-fade-up cursor-pointer flex-col overflow-hidden rounded-2xl border border-sand/80 bg-paper shadow-[0_2px_12px_-8px_rgba(52,34,47,0.18)] hover:border-crust/40 hover:shadow-[0_18px_38px_-16px_rgba(107,42,78,0.45)]"
    >
      {/* Vignette produit : photo si disponible, sinon dégradé + emoji */}
      <div
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden"
        style={produit.image ? { background: 'var(--color-photo)' } : { background: `linear-gradient(150deg, ${produit.from}, ${produit.to})` }}
      >
        {produit.image ? (
          <img
            src={produit.image}
            alt={produit.nom}
            loading="lazy"
            className={`h-full w-full object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-[1.07] ${epuise ? 'opacity-40 grayscale' : ''}`}
          />
        ) : (
          <span className={`text-5xl ${epuise ? 'opacity-40 grayscale' : ''}`}>{produit.emoji}</span>
        )}
        {/* Fondu très doux vers la couleur de la carte : sépare la photo du
            texte sans la ternir (l'ancien voile noir salissait les photos). */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-paper/50 to-transparent" />

        {epuise && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-1.5 text-center text-xs font-semibold uppercase tracking-widest text-white">
            Épuisé aujourd'hui
          </span>
        )}

        {produit.nouveau && !epuise && (
          <span className="absolute left-3 top-3 rounded-full bg-crust px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm ring-1 ring-[#e9cd90]/50">
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
            className={`absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full shadow-[0_4px_12px_-2px_rgba(107,42,78,0.35)] ring-1 ring-black/5 transition-all duration-200 active:scale-90 ${
              ajoute
                ? 'scale-110 bg-emerald-600 text-white'
                : 'bg-paper text-crust hover:scale-110 hover:bg-crust hover:text-white hover:shadow-[0_6px_18px_-3px_rgba(107,42,78,0.55)]'
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
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <span className="price whitespace-nowrap text-[17px] font-bold leading-none text-ember">
            {formatPrix(produit.prix)}
          </span>
          {produit.delaiPreparation > 0 && !epuise && (
            <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-sand-soft px-2 py-0.5 text-[11px] font-medium text-stone-warm">
              <Timer size={12} /> ~{produit.delaiPreparation} min
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
