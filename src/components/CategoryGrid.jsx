import { useShop } from '../context/ShopContext'

// Grille des catégories — vignettes sobres, sans animation tape-à-l'œil.
// Un clic sur une catégorie filtre les produits (via onSelect).
export default function CategoryGrid({ onSelect }) {
  const { categories } = useShop()
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">La boutique</p>
        <h2 className="mt-1 text-2xl text-ink sm:text-3xl">Nos catégories</h2>
        <span className="mt-3 block h-[3px] w-12 rounded-full bg-gradient-to-r from-gilt to-gilt/20" />
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect?.(cat.id)}
            className="group relative flex aspect-[5/4] flex-col items-start justify-end overflow-hidden rounded-xl p-4 text-left text-white"
            style={{ background: `linear-gradient(150deg, ${cat.from}, ${cat.to})` }}
          >
            {/* Voile qui s'assombrit légèrement au survol (transition de couleur, pas de mouvement) */}
            <div className="absolute inset-0 bg-black/15 transition-colors duration-300 group-hover:bg-black/30" />
            <span className="relative text-3xl">{cat.emoji}</span>
            <span className="relative mt-1.5 text-sm font-semibold drop-shadow-sm">{cat.nom}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
