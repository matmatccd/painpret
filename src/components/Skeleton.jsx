// ============================================================
//  Squelettes de chargement (placeholders animés)
//  -----------------------------------------------------------
//  Aujourd'hui les données sont "en dur", donc on simule un
//  court chargement au démarrage. Quand on branchera une vraie
//  base (Supabase), ces squelettes s'afficheront pendant les
//  vrais temps de chargement — le code est déjà prêt.
// ============================================================

// Une carte produit en cours de chargement
function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-sand bg-paper">
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="space-y-2 px-4 py-3">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton mt-1 h-4 w-14 rounded" />
      </div>
    </div>
  )
}

// Écran d'accueil en cours de chargement (bannière + grille)
export default function HomeSkeleton() {
  return (
    <div aria-busy="true" aria-label="Chargement de la boutique">
      {/* Bannière */}
      <div className="mx-auto w-full max-w-6xl px-4 pt-6">
        <div className="skeleton h-[300px] w-full rounded-2xl sm:h-[360px]" />
      </div>

      {/* Section de produits */}
      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="skeleton mb-6 h-8 w-52 rounded" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </div>
  )
}
