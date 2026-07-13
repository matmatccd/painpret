// ============================================================
//  Charge du fournil : délai de préparation dynamique
//  -----------------------------------------------------------
//  Quand un produit est très demandé (beaucoup d'unités commandées
//  et pas encore prêtes), son délai de préparation s'allonge
//  automatiquement pour laisser le temps au boulanger :
//    chaque tranche de 5 unités en attente = +5 minutes (max +30).
// ============================================================

// Quantité d'un produit dans les commandes encore À PRÉPARER
export function quantiteEnAttente(produitId, commandes) {
  return commandes
    .filter((c) => c.statut === 'a-preparer')
    .reduce(
      (total, c) =>
        total +
        (c.articles || [])
          .filter((a) => a.produitId === produitId)
          .reduce((s, a) => s + (a.quantite || 0), 0),
      0,
    )
}

// Minutes ajoutées au délai du produit selon la file d'attente
export function surchargeProduit(produitId, commandes) {
  const enAttente = quantiteEnAttente(produitId, commandes)
  return Math.min(30, Math.floor(enAttente / 5) * 5)
}
