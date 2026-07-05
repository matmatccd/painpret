import { X, Minus, Plus, Trash2, ShoppingBag, Wheat } from 'lucide-react'
import { formatPrix } from '../lib/format'
import { useCart } from '../context/CartContext'

// Panneau "panier" qui glisse depuis la droite.
export default function CartDrawer({ ouvert, onFermer, onCheckout }) {
  const { lignes, modifierQuantite, retirer, total, nombreArticles } = useCart()

  return (
    <>
      {/* Voile sombre (clic = fermer) */}
      <div
        onClick={onFermer}
        className={`fixed inset-0 z-50 bg-ink/45 transition-opacity duration-300 ${
          ouvert ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          ouvert ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-sand px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg text-ink">
            <ShoppingBag size={19} />
            Mon panier
            {nombreArticles > 0 && (
              <span className="rounded-full bg-ember px-2 py-0.5 font-sans text-sm font-semibold text-white">
                {nombreArticles}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={onFermer}
            aria-label="Fermer le panier"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-warm transition-colors hover:bg-sand/60"
          >
            <X size={20} />
          </button>
        </div>

        {lignes.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-paper text-crust ring-1 ring-sand">
              <Wheat size={30} />
            </span>
            <p className="mt-4 font-display text-lg text-ink">Votre panier est vide</p>
            <p className="mt-1 text-sm text-stone-warm">
              Ajoutez des produits de La Pétrie pour commencer.
            </p>
            <button
              type="button"
              onClick={onFermer}
              className="mt-5 rounded-lg border border-sand bg-paper px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-crust/40"
            >
              Parcourir la boutique
            </button>
          </div>
        ) : (
          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {lignes.map((ligne) => (
              <div
                key={ligne.cle}
                className="flex gap-3 rounded-xl border border-sand bg-paper p-3"
              >
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg text-3xl"
                  style={{ background: `linear-gradient(150deg, ${ligne.produit.from}, ${ligne.produit.to})` }}
                >
                  {ligne.produit.emoji}
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold leading-snug text-ink">{ligne.produit.nom}</p>
                      {ligne.varianteNom && (
                        <p className="text-xs text-stone-warm">{ligne.varianteNom}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => retirer(ligne.cle)}
                      aria-label="Retirer l’article"
                      className="text-stone-warm transition-colors hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {ligne.remarque && (
                    <p className="mt-0.5 text-xs italic text-stone-warm">« {ligne.remarque} »</p>
                  )}

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-sand bg-cream">
                      <button
                        type="button"
                        aria-label="Diminuer"
                        onClick={() => modifierQuantite(ligne.cle, ligne.quantite - 1)}
                        className="flex h-8 w-8 items-center justify-center text-stone-warm transition-colors hover:text-ink"
                      >
                        <Minus size={15} />
                      </button>
                      <span className="tnum w-7 text-center text-sm font-semibold">{ligne.quantite}</span>
                      <button
                        type="button"
                        aria-label="Augmenter"
                        onClick={() => modifierQuantite(ligne.cle, ligne.quantite + 1)}
                        className="flex h-8 w-8 items-center justify-center text-stone-warm transition-colors hover:text-ink"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                    <span className="price font-bold text-ink">
                      {formatPrix(ligne.prixUnitaire * ligne.quantite)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {lignes.length > 0 && (
          <div className="border-t border-sand bg-paper px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-ink">Total</span>
              <span className="price text-lg font-bold text-ember">{formatPrix(total)}</span>
            </div>
            <button
              type="button"
              onClick={onCheckout}
              className="w-full rounded-xl bg-crust py-3.5 font-semibold text-white transition-colors hover:bg-crust-dark active:scale-[0.99]"
            >
              Choisir mon créneau de retrait
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
