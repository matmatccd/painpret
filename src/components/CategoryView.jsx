import { ArrowLeft } from 'lucide-react'
import ProductCard from './ProductCard'

// Liste des produits d'une catégorie.
export default function CategoryView({ categorie, produits, onRetour, onOpen }) {
  return (
    <section className="mx-auto w-full max-w-6xl animate-fade-up px-4 py-8">
      <button
        type="button"
        onClick={onRetour}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-stone-warm transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} /> Toutes les catégories
      </button>

      <header className="mb-6 flex items-center gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl text-white"
          style={{ background: `linear-gradient(150deg, ${categorie.from}, ${categorie.to})` }}
        >
          {categorie.emoji}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">Catégorie</p>
          <h2 className="text-2xl text-ink sm:text-3xl">{categorie.nom}</h2>
          <span className="mt-2 block h-[3px] w-12 rounded-full bg-gradient-to-r from-gilt to-gilt/20" />
        </div>
      </header>

      {produits.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {produits.map((produit, i) => (
            <ProductCard key={produit.id} produit={produit} onOpen={onOpen} index={i} />
          ))}
        </div>
      ) : (
        <p className="text-stone-warm">
          Aucun produit dans cette catégorie pour le moment.
        </p>
      )}
    </section>
  )
}
