import ProductCard from './ProductCard'

// Section "titre + grille de produits".
export default function ProductRow({ titre, surtitre, produits, onOpen, favoris = [], onToggleFavori }) {
  if (!produits || produits.length === 0) return null

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8">
      <header className="mb-6">
        {surtitre && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">{surtitre}</p>
        )}
        <h2 className="mt-1 text-2xl text-ink sm:text-3xl">{titre}</h2>
        <span className="filet-titre" aria-hidden="true" />
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {produits.map((produit, i) => (
          <ProductCard
            key={produit.id}
            produit={produit}
            onOpen={onOpen}
            index={i}
            favori={favoris.includes(produit.id)}
            onToggleFavori={onToggleFavori}
          />
        ))}
      </div>
    </section>
  )
}
