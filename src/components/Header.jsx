import { Search, ShoppingBag, Store, History } from 'lucide-react'
import { useCart } from '../context/CartContext'
import Logo from './Logo'
import NotificationBell from './NotificationBell'

// En-tête aux couleurs de la devanture La Pétrie : bandeau prune,
// lettrage clair — comme l'enseigne de la boutique.
export default function Header({ recherche, setRecherche, onAccueil, onOuvrirPanier, onEspacePro, onHistorique }) {
  const { nombreArticles } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[#e9cd90]/60 bg-crust">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:gap-5">
        {/* Logo */}
        <button type="button" onClick={onAccueil} className="shrink-0">
          <Logo taille="sm" clair />
        </button>

        {/* Recherche */}
        <div className="relative flex-1">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-warm"
          />
          <input
            type="search"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un pain…"
            className="w-full rounded-lg border border-white/20 bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition placeholder:text-stone-warm/70 focus:ring-2 focus:ring-[#e9cd90]/50"
          />
        </div>

        {/* Mes commandes (historique) */}
        <button
          type="button"
          onClick={onHistorique}
          aria-label="Mes commandes"
          title="Mes commandes"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/85 ring-1 ring-white/20 transition-colors hover:bg-white/20 hover:text-white"
        >
          <History size={18} />
        </button>

        {/* Accès direct à l'espace boulanger (pro) */}
        <button
          type="button"
          onClick={onEspacePro}
          aria-label="Espace boulanger"
          title="Espace boulanger"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white/85 ring-1 ring-white/20 transition-colors hover:bg-white/20 hover:text-white"
        >
          <Store size={18} />
        </button>

        {/* Notifications */}
        <NotificationBell clair />

        {/* Panier */}
        <button
          type="button"
          onClick={onOuvrirPanier}
          aria-label="Voir le panier"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-crust transition-colors hover:bg-[#f2d3d8]"
        >
          <ShoppingBag size={18} />
          {nombreArticles > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1 text-[11px] font-bold text-white">
              {nombreArticles}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
