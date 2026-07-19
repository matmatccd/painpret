import { useEffect, useRef, useState } from 'react'
import { Search, ShoppingBag, History } from 'lucide-react'
import { useCart } from '../context/CartContext'
import Logo from './Logo'
import NotificationBell from './NotificationBell'
import BoutonTheme from './BoutonTheme'

// En-tête aux couleurs de la devanture La Pétrie : bandeau prune,
// lettrage clair — comme l'enseigne de la boutique.
// Il se range quand on descend dans la page et revient dès qu'on remonte.
export default function Header({ recherche, setRecherche, onAccueil, onOuvrirPanier, onEspacePro, onHistorique }) {
  const { nombreArticles } = useCart()
  const [cache, setCache] = useState(false)

  // Accès boulanger DISCRET : appui long (0,7 s) sur le logo -> espace pro.
  // Invisible pour les clients, pratique pour le boulanger.
  const minuteurAppui = useRef(null)
  const appuiLong = useRef(false)
  function debutAppuiLogo() {
    appuiLong.current = false
    minuteurAppui.current = setTimeout(() => {
      appuiLong.current = true
      onEspacePro?.()
    }, 700)
  }
  function finAppuiLogo() {
    clearTimeout(minuteurAppui.current)
  }
  function clicLogo() {
    if (appuiLong.current) {
      appuiLong.current = false
      return // c'était un appui long -> déjà géré (espace pro)
    }
    onAccueil()
  }

  useEffect(() => {
    let dernierY = window.scrollY
    function surDefilement() {
      const y = window.scrollY
      if (y < 80) {
        // Tout en haut de la page : toujours visible
        setCache(false)
      } else if (y > dernierY + 6) {
        // On descend : on range le bandeau
        setCache(true)
      } else if (y < dernierY - 6) {
        // On remonte : on le fait revenir
        setCache(false)
      }
      dernierY = y
    }
    window.addEventListener('scroll', surDefilement, { passive: true })
    return () => window.removeEventListener('scroll', surDefilement)
  }, [])

  // Champ de recherche réutilisé (inline sur ordinateur, pleine largeur sur mobile)
  const ChampRecherche = ({ className = '' }) => (
    <div className={`relative ${className}`}>
      <Search
        size={17}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-warm"
      />
      <input
        type="search"
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        placeholder="Rechercher un pain…"
        className="w-full rounded-lg border border-white/20 bg-paper py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition placeholder:text-stone-warm/70 focus:ring-2 focus:ring-[#e9cd90]/50"
      />
    </div>
  )

  return (
    <header
      className={`sticky top-0 z-40 border-b-2 border-[#e9cd90]/60 bg-crust transition-transform duration-300 ${
        cache ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-3">
       <div className="flex items-center gap-2.5 sm:gap-5">
        {/* Logo (appui long = accès boulanger discret) */}
        <button
          type="button"
          onClick={clicLogo}
          onPointerDown={debutAppuiLogo}
          onPointerUp={finAppuiLogo}
          onPointerLeave={finAppuiLogo}
          onContextMenu={(e) => e.preventDefault()}
          className="shrink-0 select-none"
        >
          <Logo taille="sm" clair />
        </button>

        {/* Recherche — inline sur ordinateur uniquement */}
        <ChampRecherche className="hidden flex-1 sm:block" />

        {/* Sur mobile, pousse les icônes à droite (la recherche est en 2e ligne) */}
        <div className="flex-1 sm:hidden" />

        {/* Mes commandes (historique) */}
        <button
          type="button"
          onClick={onHistorique}
          aria-label="Mes commandes"
          title="Mes commandes"
          className="icone-vive anim-remonte flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/85 ring-1 ring-white/20 transition-colors hover:bg-white/15 hover:text-[#e9cd90] hover:ring-[#e9cd90]/60"
        >
          <History size={18} />
        </button>

        {/* Mode clair / sombre */}
        <BoutonTheme />

        {/* Notifications */}
        <NotificationBell clair />

        {/* Panier — bouton doré, bien visible */}
        <button
          type="button"
          onClick={onOuvrirPanier}
          aria-label="Voir le panier"
          className="icone-vive anim-saute relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9cd90] text-crust-dark transition-colors hover:bg-[#f7e8c4]"
        >
          <ShoppingBag size={18} />
          {nombreArticles > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1 text-[11px] font-bold text-white ring-2 ring-crust">
              {nombreArticles}
            </span>
          )}
        </button>
       </div>

       {/* Recherche pleine largeur sur mobile (2e ligne) */}
       <ChampRecherche className="mt-2.5 sm:hidden" />
      </div>
    </header>
  )
}
