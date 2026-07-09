import { createContext, useContext, useMemo, useState } from 'react'
import { productsInitiaux, commandesInitiales, categoriesInitiales } from '../data/bakery'

// ============================================================
//  Le "magasin partagé"
//  -----------------------------------------------------------
//  Contient les produits (avec leur stock) et les commandes.
//  Le côté CLIENT lit cet état (pour savoir ce qui est disponible).
//  Le côté BOULANGER le modifie (stock, statut des commandes).
//  Comme c'est partagé, une modification du boulanger est vue
//  immédiatement par le client : c'est la "disponibilité en temps réel".
// ============================================================

const ShopContext = createContext(null)

// L'ordre des statuts d'une commande, du début à la fin.
// Trois étapes simples : à préparer -> prête -> livrée.
export const STATUTS = ['a-preparer', 'prete', 'livree']

export function ShopProvider({ children }) {
  // La liste des produits est désormais entièrement modifiable
  // (le boulanger peut ajuster le stock, ajouter ou supprimer un produit).
  // On part d'une COPIE des données initiales.
  const [produitsBase, setProduitsBase] = useState(() => productsInitiaux.map((p) => ({ ...p })))
  const [commandes, setCommandes] = useState(commandesInitiales)
  // Catégories modifiables par le boulanger (avec leurs sous-catégories)
  const [categories, setCategories] = useState(() =>
    categoriesInitiales.map((c) => ({ ...c, sousCategories: [...c.sousCategories] })),
  )

  // --- Fermeture exceptionnelle (congés, jour férié) ---
  // Quand c'est fermé, les clients ne peuvent plus commander.
  // Mémorisé sur l'appareil pour survivre à un rafraîchissement.
  const [boutiqueFermee, setBoutiqueFermee] = useState(
    () => localStorage.getItem('painpret_fermee') === '1',
  )
  function basculerFermeture() {
    setBoutiqueFermee((etat) => {
      const suivant = !etat
      localStorage.setItem('painpret_fermee', suivant ? '1' : '0')
      return suivant
    })
  }

  // Les produits "vivants" : on ajoute "disponible" = il reste au moins 1 en stock.
  const produits = useMemo(
    () => produitsBase.map((p) => ({ ...p, disponible: p.stock > 0 })),
    [produitsBase],
  )

  // Petit utilitaire interne : modifier un produit par son id
  function modifierProduit(id, modif) {
    setProduitsBase((arr) => arr.map((p) => (p.id === id ? { ...p, ...modif(p) } : p)))
  }

  // --- Côté boulanger : ajuster le stock d'un produit (+ ou -) ---
  function ajusterStock(id, delta) {
    modifierProduit(id, (p) => ({ stock: Math.max(0, p.stock + delta) }))
  }

  // --- Marquer un produit épuisé (stock = 0) ---
  function marquerEpuise(id) {
    modifierProduit(id, () => ({ stock: 0 }))
  }

  // --- Remettre un produit en stock (quantité par défaut) ---
  function remettreEnStock(id, quantite = 10) {
    modifierProduit(id, () => ({ stock: quantite }))
  }

  // --- Côté boulanger : créer un nouveau produit ---
  function ajouterProduit(donnees) {
    setProduitsBase((arr) => {
      const nouvelId = arr.reduce((max, p) => Math.max(max, p.id), 0) + 1
      return [...arr, { id: nouvelId, ...donnees }]
    })
  }

  // --- Côté boulanger : modifier un produit existant ---
  function mettreAJourProduit(id, donnees) {
    setProduitsBase((arr) => arr.map((p) => (p.id === id ? { ...p, ...donnees } : p)))
  }

  // --- Côté boulanger : supprimer un produit ---
  function supprimerProduit(id) {
    setProduitsBase((arr) => arr.filter((p) => p.id !== id))
  }

  // --- Catégories : ajouter une nouvelle catégorie (avec photo facultative) ---
  function ajouterCategorie({ nom, emoji, from, to, image = null }) {
    // id "slug" à partir du nom (ex : "Pains spéciaux" -> "pains-speciaux")
    const sansAccents = nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    const id =
      sansAccents.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `cat-${Date.now()}`
    setCategories((arr) => {
      if (arr.some((c) => c.id === id)) return arr // évite les doublons
      return [...arr, { id, nom: nom.trim(), emoji: emoji || '🥐', from: from || '#e9b872', to: to || '#c98a3a', image, sousCategories: [] }]
    })
  }

  // --- Catégories : supprimer une catégorie ---
  function supprimerCategorie(id) {
    setCategories((arr) => arr.filter((c) => c.id !== id))
  }

  // --- Sous-catégories : ajouter dans une catégorie ---
  function ajouterSousCategorie(catId, nom) {
    const propre = nom.trim()
    if (!propre) return
    setCategories((arr) =>
      arr.map((c) =>
        c.id === catId && !c.sousCategories.includes(propre)
          ? { ...c, sousCategories: [...c.sousCategories, propre] }
          : c,
      ),
    )
  }

  // --- Sous-catégories : supprimer d'une catégorie ---
  function supprimerSousCategorie(catId, nom) {
    setCategories((arr) =>
      arr.map((c) =>
        c.id === catId ? { ...c, sousCategories: c.sousCategories.filter((s) => s !== nom) } : c,
      ),
    )
  }

  // --- Côté client : passer une commande (commande en ligne, retrait en boutique) ---
  // Crée une commande "à préparer" qui apparaît aussitôt côté boulanger,
  // et DÉCOMPTE le stock des produits commandés (épuisé automatique à 0).
  // Renvoie la commande créée (pour afficher le numéro + QR Code).
  function ajouterCommande({ articles, total, creneau, heureRetrait, client = '' }) {
    const nouvelle = {
      id: Date.now(),
      // Numéro lisible : lettre + 2 chiffres (ex : "B47")
      numero: 'B' + Math.floor(10 + Math.random() * 89),
      client, // le prénom du client ("Commande pour Julie !")
      date: Date.now(), // pour les statistiques de la semaine
      creneau,
      heureRetrait,
      statut: 'a-preparer',
      articles,
      total,
      arrive: false, // le client a-t-il signalé son arrivée en boutique ?
      nouvelle: true, // pour signaler une commande fraîche côté boulanger
    }
    setCommandes((cmds) => [...cmds, nouvelle])

    // Le stock baisse immédiatement (les articles portent l'id du produit)
    setProduitsBase((arr) =>
      arr.map((p) => {
        const commande = articles
          .filter((a) => a.produitId === p.id)
          .reduce((n, a) => n + a.quantite, 0)
        return commande > 0 ? { ...p, stock: Math.max(0, p.stock - commande) } : p
      }),
    )

    return nouvelle
  }

  // --- Côté client : signaler son arrivée en boutique ---
  // Le boulanger voit aussitôt un badge "Client sur place" sur la commande.
  function signalerArrivee(id) {
    setCommandes((cmds) => cmds.map((c) => (c.id === id ? { ...c, arrive: true } : c)))
  }

  // --- Côté boulanger : valider un retrait via le numéro de commande (scan QR) ---
  // Renvoie { ok, commande, raison } pour afficher un message clair.
  function validerRetrait(saisie) {
    const texte = (saisie || '').trim().toUpperCase()
    if (!texte) return { ok: false, raison: 'vide' }

    // On accepte le contenu brut du QR ("PAINPRET|B41|11:30") ou juste "B41"
    const commande = commandes.find((c) => texte.includes(c.numero.toUpperCase()))
    if (!commande) return { ok: false, raison: 'introuvable' }
    if (commande.statut === 'livree') return { ok: false, raison: 'deja', commande }

    setCommandes((cmds) =>
      cmds.map((c) => (c.id === commande.id ? { ...c, statut: 'livree' } : c)),
    )
    return { ok: true, commande }
  }

  // --- Côté boulanger : choisir directement le statut d'une commande ---
  // (on peut avancer OU revenir en arrière : simple et sans piège)
  function changerStatut(id, statut) {
    if (!STATUTS.includes(statut)) return
    setCommandes((cmds) => cmds.map((c) => (c.id === id ? { ...c, statut } : c)))
  }

  // --- Faire avancer une commande au statut suivant (raccourci) ---
  function avancerCommande(id) {
    setCommandes((cmds) =>
      cmds.map((c) => {
        if (c.id !== id) return c
        const indexActuel = STATUTS.indexOf(c.statut)
        const suivant = STATUTS[Math.min(indexActuel + 1, STATUTS.length - 1)]
        return { ...c, statut: suivant }
      }),
    )
  }

  const valeur = {
    produits,
    commandes,
    ajusterStock,
    marquerEpuise,
    remettreEnStock,
    ajouterProduit,
    mettreAJourProduit,
    supprimerProduit,
    categories,
    ajouterCategorie,
    supprimerCategorie,
    ajouterSousCategorie,
    supprimerSousCategorie,
    ajouterCommande,
    signalerArrivee,
    changerStatut,
    avancerCommande,
    validerRetrait,
    boutiqueFermee,
    basculerFermeture,
  }

  return <ShopContext.Provider value={valeur}>{children}</ShopContext.Provider>
}

// Raccourci pour utiliser le magasin : const { produits } = useShop()
export function useShop() {
  const contexte = useContext(ShopContext)
  if (!contexte) {
    throw new Error('useShop doit être utilisé à l’intérieur de <ShopProvider>')
  }
  return contexte
}
