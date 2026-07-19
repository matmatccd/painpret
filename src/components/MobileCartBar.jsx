import { ShoppingBag, ChevronRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { formatPrix } from '../lib/format'

// Barre panier flottante, visible uniquement sur mobile quand le panier
// n'est pas vide. Un accès rapide au panier depuis n'importe quelle page.
export default function MobileCartBar({ onOuvrir }) {
  const { nombreArticles, total } = useCart()

  if (nombreArticles === 0) return null

  return (
    <div className="animate-glisse-haut fixed inset-x-0 bottom-0 z-30 border-t border-sand bg-cream p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden">
      <button
        type="button"
        onClick={onOuvrir}
        className="flex w-full items-center justify-between rounded-xl bg-crust px-4 py-3 text-white transition-colors hover:bg-crust-dark active:scale-[0.99]"
      >
        <span className="flex items-center gap-2 font-semibold">
          <span className="relative">
            <ShoppingBag size={19} />
            <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember px-1 text-[10px] font-bold">
              {nombreArticles}
            </span>
          </span>
          Voir le panier
        </span>
        <span className="flex items-center gap-1">
          <span className="price font-bold">{formatPrix(total)}</span>
          <ChevronRight size={18} />
        </span>
      </button>
    </div>
  )
}
