import { Search, ShoppingBag, Store, History } from 'lucide-react'
import { useCart } from '../context/CartContext'
import Logo from './Logo'
import NotificationBell from './NotificationBell'

// En-tête : logo PainPrêt, recherche, historique, notifications, panier, accès pro.
export default function Header({ recherche, setRecherche, onAccueil, onOuvrirPanier, onEspacePro, onHistorique }) {
  const { nombreArticles } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-cream/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-3 sm:gap-5">
        {/* Logo */}
        <button type="button" onClick={onAccueil} className="shrink-0">
          <Logo taille="sm" />
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
            className="w-full rounded-lg border border-sand bg-paper py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition placeholder:text-stone-warm/70 focus:border-crust focus:ring-2 focus:ring-crust/15"
          />
        </div>

        {/* Mes commandes (historique) */}
        <button
          type="button"
          onClick={onHistorique}
          aria-label="Mes commandes"
          title="Mes commandes"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sand bg-paper text-stone-warm transition-colors hover:border-crust/40 hover:text-crust"
        >
          <History size={18} />
        </button>

        {/* Accès direct à l'espace boulanger (pro) */}
        <button
          type="button"
          onClick={onEspacePro}
          aria-label="Espace boulanger"
          title="Espace boulanger"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-sand bg-paper text-stone-warm transition-colors hover:border-crust/40 hover:text-crust"
        >
          <Store size={18} />
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Panier */}
        <button
          type="button"
          onClick={onOuvrirPanier}
          aria-label="Voir le panier"
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-white transition-colors hover:bg-crust-dark"
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
