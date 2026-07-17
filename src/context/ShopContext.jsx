import { createContext, useContext, useMemo, useState, useEffect } from 'react'
import { productsInitiaux, commandesInitiales, categoriesInitiales } from '../data/bakery'
import { resolveImage } from '../data/images'
import { supabase, modeReel } from '../lib/supabase'

// ============================================================
//  Le "magasin partagé"
//  -----------------------------------------------------------
//  MODE RÉEL (Supabase configuré) : produits, commandes et
//  réglages viennent de la vraie base, partagée entre tous les
//  appareils, et se mettent à jour en TEMPS RÉEL.
//  MODE DÉMO (pas de clés) : tout est local, comme avant.
// ============================================================

const ShopContext = createContext(null)

// L'ordre des statuts d'une commande : à préparer -> prête -> livrée.
export const STATUTS = ['a-preparer', 'prete', 'livree']

// Le badge "Nouveau" est automatique : il disparaît 3 jours après la mise en ligne.
const DUREE_NOUVEAU = 3 * 24 * 60 * 60 * 1000
// Une commande est "nouvelle" (badge côté boulanger) pendant 5 minutes.
const DUREE_COMMANDE_NEUVE = 5 * 60 * 1000

// --- Conversions entre la base (colonnes en_minuscules) et l'appli ---
function produitDepuisRow(r) {
  return {
    id: r.id,
    nom: r.nom,
    categorie: r.categorie,
    sousCategorie: r.sous_categorie,
    prix: Number(r.prix),
    description: r.description || '',
    image: r.image, // clé ou photo téléversée (résolue plus bas)
    emoji: r.emoji || '🥖',
    ingredients: r.ingredients || [],
    allergenes: r.allergenes || [],
    delaiPreparation: r.delai_preparation ?? 10,
    stock: r.stock ?? 0,
    populaire: r.populaire || false,
    creeLe: r.cree_le ? new Date(r.cree_le).getTime() : null,
  }
}

function rowDepuisProduit(p) {
  return {
    nom: p.nom,
    categorie: p.categorie,
    sous_categorie: p.sousCategorie ?? null,
    prix: p.prix,
    description: p.description ?? '',
    image: p.image ?? null,
    emoji: p.emoji ?? '🥖',
    ingredients: p.ingredients ?? [],
    allergenes: p.allergenes ?? [],
    delai_preparation: p.delaiPreparation ?? 10,
    stock: p.stock ?? 0,
    populaire: p.populaire ?? false,
  }
}

function commandeDepuisRow(r) {
  const cree = r.cree_le ? new Date(r.cree_le).getTime() : Date.now()
  return {
    id: r.id,
    numero: r.numero,
    client: r.client || '',
    email: r.email || '',
    telephone: r.telephone || '',
    stripeSession: r.stripe_session || null,
    creneau: r.creneau,
    heureRetrait: r.heure_retrait,
    statut: r.statut,
    articles: r.articles || [],
    total: Number(r.total),
    arrive: r.arrive || false,
    remboursee: r.remboursee || false,
    date: cree,
    nouvelle: Date.now() - cree < DUREE_COMMANDE_NEUVE,
  }
}

function categorieDepuisRow(r) {
  return {
    id: r.id,
    nom: r.nom,
    emoji: r.emoji || '🥐',
    from: r.couleur_from || '#e9b872',
    to: r.couleur_to || '#c98a3a',
    image: r.image,
    sousCategories: r.sous_categories || [],
    ordre: r.ordre ?? 0,
  }
}

export function ShopProvider({ children }) {
  // En mode réel on part de listes vides (remplies par la base) ; en démo, des données factices.
  const [produitsBase, setProduitsBase] = useState(() =>
    modeReel ? [] : productsInitiaux.map((p) => ({ ...p })),
  )
  const [commandes, setCommandes] = useState(() => (modeReel ? [] : commandesInitiales))
  const [categoriesState, setCategoriesState] = useState(() =>
    modeReel ? [] : categoriesInitiales.map((c) => ({ ...c, sousCategories: [...c.sousCategories] })),
  )
  const [boutiqueFermee, setBoutiqueFermee] = useState(
    () => !modeReel && localStorage.getItem('painpret_fermee') === '1',
  )
  // Pause du fournil (coup de feu) : date de fin, ou null si pas de pause
  const [pauseJusqua, setPauseJusqua] = useState(null)

  // ---- Chargement initial + temps réel (mode réel uniquement) ----
  useEffect(() => {
    if (!modeReel) return
    let vivant = true

    async function chargerProduits() {
      const { data } = await supabase.from('produits').select('*').order('id')
      if (vivant && data) setProduitsBase(data.map(produitDepuisRow))
    }
    async function chargerCommandes() {
      const { data } = await supabase.from('commandes').select('*').order('cree_le')
      if (vivant && data) setCommandes(data.map(commandeDepuisRow))
    }
    async function chargerReglages() {
      const { data } = await supabase.from('reglages').select('*').eq('id', 1).maybeSingle()
      if (vivant && data) {
        setBoutiqueFermee(data.boutique_fermee)
        // Colonne pause_jusqua absente tant que le SQL n'est pas passé : null
        setPauseJusqua(data.pause_jusqua ?? null)
      }
    }
    async function chargerCategories() {
      const { data, error } = await supabase.from('categories').select('*').order('ordre')
      if (!vivant) return
      // Table pas encore créée (ou vide) -> on garde les catégories par défaut.
      if (error || !data || data.length === 0) {
        setCategoriesState(categoriesInitiales.map((c) => ({ ...c, sousCategories: [...c.sousCategories] })))
      } else {
        setCategoriesState(data.map(categorieDepuisRow))
      }
    }

    chargerProduits()
    chargerCommandes()
    chargerReglages()
    chargerCategories()

    // Abonnement temps réel : toute modification recharge la table concernée.
    const canal = supabase
      .channel('painpret-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'produits' }, chargerProduits)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commandes' }, chargerCommandes)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reglages' }, chargerReglages)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, chargerCategories)
      .subscribe()

    return () => {
      vivant = false
      supabase.removeChannel(canal)
    }
  }, [])

  // Les produits "vivants" : image résolue, disponibilité et badge "Nouveau" calculés.
  const produits = useMemo(
    () =>
      produitsBase.map((p) => {
        const cat = categoriesState.find((c) => c.id === p.categorie)
        return {
          ...p,
          image: resolveImage(p.image),
          imageRef: p.image, // valeur brute (clé ou photo), pour le formulaire
          from: p.from || cat?.from || '#e9b872',
          to: p.to || cat?.to || '#c98a3a',
          disponible: p.stock > 0,
          nouveau: Boolean(p.creeLe) && Date.now() - p.creeLe < DUREE_NOUVEAU,
        }
      }),
    [produitsBase, categoriesState],
  )

  // Catégories avec image résolue, triées par ordre
  const categories = useMemo(
    () =>
      [...categoriesState]
        .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
        .map((c) => ({ ...c, image: resolveImage(c.image), imageRef: c.image })),
    [categoriesState],
  )

  // Applique un changement en local tout de suite (réactivité), la base suit.
  function majLocaleProduit(id, champs) {
    setProduitsBase((arr) => arr.map((p) => (p.id === id ? { ...p, ...champs } : p)))
  }

  // --- Stock : ajuster (+/-), épuiser, remettre ---
  async function ajusterStock(id, delta) {
    const p = produitsBase.find((x) => x.id === id)
    if (!p) return
    const nv = Math.max(0, p.stock + delta)
    majLocaleProduit(id, { stock: nv })
    if (modeReel) await supabase.from('produits').update({ stock: nv }).eq('id', id)
  }
  async function marquerEpuise(id) {
    majLocaleProduit(id, { stock: 0 })
    if (modeReel) await supabase.from('produits').update({ stock: 0 }).eq('id', id)
  }
  async function remettreEnStock(id, quantite = 10) {
    majLocaleProduit(id, { stock: quantite })
    if (modeReel) await supabase.from('produits').update({ stock: quantite }).eq('id', id)
  }

  // --- Créer / modifier / supprimer un produit (boulanger connecté) ---
  async function ajouterProduit(donnees) {
    if (modeReel) {
      const { data, error } = await supabase
        .from('produits')
        .insert(rowDepuisProduit(donnees))
        .select()
        .single()
      if (!error && data) setProduitsBase((arr) => [...arr, produitDepuisRow(data)])
      return
    }
    setProduitsBase((arr) => {
      const nouvelId = arr.reduce((max, p) => Math.max(max, p.id), 0) + 1
      return [...arr, { id: nouvelId, creeLe: Date.now(), ...donnees }]
    })
  }
  async function mettreAJourProduit(id, donnees) {
    majLocaleProduit(id, donnees)
    if (modeReel) await supabase.from('produits').update(rowDepuisProduit(donnees)).eq('id', id)
  }
  async function supprimerProduit(id) {
    setProduitsBase((arr) => arr.filter((p) => p.id !== id))
    if (modeReel) await supabase.from('produits').delete().eq('id', id)
  }

  // --- Catégories (partagées : stockées dans la base, en temps réel) ---
  async function ajouterCategorie({ nom, emoji, from, to, image = null }) {
    const sansAccents = nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    const id =
      sansAccents.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `cat-${Date.now()}`
    if (categoriesState.some((c) => c.id === id)) return // évite les doublons
    const nouvelle = {
      id,
      nom: nom.trim(),
      emoji: emoji || '🥐',
      from: from || '#e9b872',
      to: to || '#c98a3a',
      image,
      sousCategories: [],
      ordre: categoriesState.reduce((max, c) => Math.max(max, c.ordre ?? 0), 0) + 1,
    }
    setCategoriesState((arr) => [...arr, nouvelle])
    if (modeReel) {
      await supabase.from('categories').insert({
        id, nom: nouvelle.nom, emoji: nouvelle.emoji, couleur_from: nouvelle.from,
        couleur_to: nouvelle.to, image, sous_categories: [], ordre: nouvelle.ordre,
      })
    }
  }
  async function supprimerCategorie(id) {
    setCategoriesState((arr) => arr.filter((c) => c.id !== id))
    if (modeReel) await supabase.from('categories').delete().eq('id', id)
  }
  async function ajouterSousCategorie(catId, nom) {
    const propre = nom.trim()
    if (!propre) return
    const cat = categoriesState.find((c) => c.id === catId)
    if (!cat || cat.sousCategories.includes(propre)) return
    const suivantes = [...cat.sousCategories, propre]
    setCategoriesState((arr) => arr.map((c) => (c.id === catId ? { ...c, sousCategories: suivantes } : c)))
    if (modeReel) await supabase.from('categories').update({ sous_categories: suivantes }).eq('id', catId)
  }
  async function supprimerSousCategorie(catId, nom) {
    const cat = categoriesState.find((c) => c.id === catId)
    if (!cat) return
    const suivantes = cat.sousCategories.filter((s) => s !== nom)
    setCategoriesState((arr) => arr.map((c) => (c.id === catId ? { ...c, sousCategories: suivantes } : c)))
    if (modeReel) await supabase.from('categories').update({ sous_categories: suivantes }).eq('id', catId)
  }

  // --- Pause du fournil (coup de feu) : décale les créneaux de N minutes,
  //     puis tout redémarre tout seul à la fin de la pause. ---
  async function basculerPause(minutes = 30) {
    const active = pauseJusqua && new Date(pauseJusqua).getTime() > Date.now()
    const nouvelle = active ? null : new Date(Date.now() + minutes * 60000).toISOString()
    setPauseJusqua(nouvelle)
    if (modeReel) {
      const { error } = await supabase
        .from('reglages')
        .update({ pause_jusqua: nouvelle })
        .eq('id', 1)
      if (error) {
        setPauseJusqua(null)
        throw new Error('La pause nécessite une petite mise à jour de la base (colonne pause_jusqua).')
      }
    }
  }

  // --- Fermeture exceptionnelle ---
  async function basculerFermeture() {
    const suivant = !boutiqueFermee
    setBoutiqueFermee(suivant)
    if (modeReel) {
      await supabase.from('reglages').update({ boutique_fermee: suivant }).eq('id', 1)
    } else {
      localStorage.setItem('painpret_fermee', suivant ? '1' : '0')
    }
  }

  // --- Client : passer une commande (paiement validé -> commande réelle) ---
  // Renvoie la commande créée, ou lève une erreur ('boutique_fermee' / 'stock_insuffisant').
  async function ajouterCommande({ articles, total, creneau, heureRetrait, client = '', email = '', telephone = '' }) {
    if (modeReel) {
      const { data, error } = await supabase.rpc('passer_commande', {
        p_client: client,
        p_email: email,
        p_telephone: telephone,
        p_creneau: creneau,
        p_heure_retrait: heureRetrait,
        p_articles: articles,
        p_total: total,
      })
      if (error) throw new Error(error.message)
      const commande = commandeDepuisRow(Array.isArray(data) ? data[0] : data)
      setCommandes((cmds) => (cmds.some((c) => c.id === commande.id) ? cmds : [...cmds, commande]))
      return commande
    }

    // Mode démo : commande locale + décompte du stock local
    if (boutiqueFermee) throw new Error('boutique_fermee')
    const nouvelle = {
      id: Date.now(),
      numero: 'B' + Math.floor(10 + Math.random() * 89),
      client,
      email,
      telephone,
      date: Date.now(),
      creneau,
      heureRetrait,
      statut: 'a-preparer',
      articles,
      total,
      arrive: false,
      nouvelle: true,
    }
    setCommandes((cmds) => [...cmds, nouvelle])
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

  // --- Client : signaler son arrivée en boutique ---
  async function signalerArrivee(id) {
    setCommandes((cmds) => cmds.map((c) => (c.id === id ? { ...c, arrive: true } : c)))
    if (modeReel) {
      const c = commandes.find((x) => x.id === id)
      if (c) await supabase.rpc('signaler_arrivee', { p_numero: c.numero })
    }
  }

  // --- Boulanger : changer le statut d'une commande ---
  async function changerStatut(id, statut) {
    if (!STATUTS.includes(statut)) return
    setCommandes((cmds) => cmds.map((c) => (c.id === id ? { ...c, statut } : c)))
    if (modeReel) await supabase.from('commandes').update({ statut }).eq('id', id)
  }
  async function avancerCommande(id) {
    const c = commandes.find((x) => x.id === id)
    if (!c) return
    const suivant = STATUTS[Math.min(STATUTS.indexOf(c.statut) + 1, STATUTS.length - 1)]
    await changerStatut(id, suivant)
  }

  // --- Boulanger : rembourser une commande payée (via la fonction serveur,
  //     qui parle à Stripe — l'argent repart sur la carte du client) ---
  async function rembourserCommande(id) {
    if (!modeReel) throw new Error('remboursement indisponible en mode démo')
    const { data, error } = await supabase.functions.invoke('rembourser', { body: { id } })
    if (error) throw new Error(error.message)
    if (data?.erreur) throw new Error(data.erreur)
    setCommandes((cmds) => cmds.map((c) => (c.id === id ? { ...c, remboursee: true } : c)))
    return data
  }

  // --- Boulanger : valider un retrait (scan QR ou numéro saisi) ---
  async function validerRetrait(saisie) {
    const texte = (saisie || '').trim().toUpperCase()
    if (!texte) return { ok: false, raison: 'vide' }
    const commande = commandes.find((c) => texte.includes(c.numero.toUpperCase()))
    if (!commande) return { ok: false, raison: 'introuvable' }
    if (commande.statut === 'livree') return { ok: false, raison: 'deja', commande }
    await changerStatut(commande.id, 'livree')
    return { ok: true, commande }
  }

  const valeur = {
    produits,
    commandes,
    categories,
    ajusterStock,
    marquerEpuise,
    remettreEnStock,
    ajouterProduit,
    mettreAJourProduit,
    supprimerProduit,
    ajouterCategorie,
    supprimerCategorie,
    ajouterSousCategorie,
    supprimerSousCategorie,
    ajouterCommande,
    signalerArrivee,
    rembourserCommande,
    changerStatut,
    avancerCommande,
    validerRetrait,
    boutiqueFermee,
    basculerFermeture,
    pauseJusqua,
    basculerPause,
  }

  return <ShopContext.Provider value={valeur}>{children}</ShopContext.Provider>
}

// Raccourci : const { produits } = useShop()
export function useShop() {
  const contexte = useContext(ShopContext)
  if (!contexte) {
    throw new Error('useShop doit être utilisé à l’intérieur de <ShopProvider>')
  }
  return contexte
}
