import { createContext, useContext, useMemo, useState } from 'react'

// ============================================================
//  Le "panier partagé"
//  -----------------------------------------------------------
//  Un Contexte React = une boîte de données accessible par
//  TOUTES les pages, sans avoir à se la passer de main en main.
//  Ici, la boîte contient le panier et les fonctions pour le modifier.
// ============================================================

const CartContext = createContext(null)

// Petite clé unique pour distinguer un même produit selon sa variante.
// Ex : "Tarte aux fraises - Part individuelle" et "... - 4 parts" sont 2 lignes.
function cleLigne(produitId, varianteNom) {
  return `${produitId}-${varianteNom || 'default'}`
}

export function CartProvider({ children }) {
  // Le panier = un tableau de lignes.
  // Chaque ligne : { cle, produit, quantite, varianteNom, prixUnitaire, remarque }
  const [lignes, setLignes] = useState([])

  // --- Ajouter un produit au panier ---
  function ajouter(produit, { quantite = 1, varianteNom = null, prixUnitaire, remarque = '' } = {}) {
    // Si pas de prix précisé, on prend le prix de base du produit
    const prix = prixUnitaire ?? produit.prix
    const cle = cleLigne(produit.id, varianteNom)

    setLignes((actuelles) => {
      const existante = actuelles.find((l) => l.cle === cle)
      if (existante) {
        // Déjà dans le panier → on augmente juste la quantité
        return actuelles.map((l) =>
          l.cle === cle
            ? { ...l, quantite: l.quantite + quantite, remarque: remarque || l.remarque }
            : l,
        )
      }
      // Sinon, nouvelle ligne
      return [
        ...actuelles,
        { cle, produit, quantite, varianteNom, prixUnitaire: prix, remarque },
      ]
    })
  }

  // --- Changer la quantité d'une ligne (0 = on la retire) ---
  function modifierQuantite(cle, nouvelleQuantite) {
    setLignes((actuelles) => {
      if (nouvelleQuantite <= 0) {
        return actuelles.filter((l) => l.cle !== cle)
      }
      return actuelles.map((l) =>
        l.cle === cle ? { ...l, quantite: nouvelleQuantite } : l,
      )
    })
  }

  // --- Retirer complètement une ligne ---
  function retirer(cle) {
    setLignes((actuelles) => actuelles.filter((l) => l.cle !== cle))
  }

  // --- Vider tout le panier ---
  function viderPanier() {
    setLignes([])
  }

  // --- Calculs (recalculés automatiquement quand le panier change) ---
  const nombreArticles = useMemo(
    () => lignes.reduce((total, l) => total + l.quantite, 0),
    [lignes],
  )
  const total = useMemo(
    () => lignes.reduce((somme, l) => somme + l.prixUnitaire * l.quantite, 0),
    [lignes],
  )

  const valeur = {
    lignes,
    ajouter,
    modifierQuantite,
    retirer,
    viderPanier,
    nombreArticles,
    total,
  }

  return <CartContext.Provider value={valeur}>{children}</CartContext.Provider>
}

// Petit raccourci pour utiliser le panier dans n'importe quel composant :
//   const { ajouter, total } = useCart()
export function useCart() {
  const contexte = useContext(CartContext)
  if (!contexte) {
    throw new Error('useCart doit être utilisé à l’intérieur de <CartProvider>')
  }
  return contexte
}
