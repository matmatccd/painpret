// ============================================================
//  PainPrêt — Données factices (mock data)
//  -----------------------------------------------------------
//  Pour le MVP, une seule boulangerie : La Pétrie.
//  Ces données sont "en dur" pour construire l'interface.
//  Plus tard, elles viendront d'une vraie base de données (Supabase).
// ============================================================

// Vraies photos des pains La Pétrisane (fond blanc, studio)
import baguetteOrdinaire from '../assets/photos/baguette-ordinaire.jpg'
import baguetteTradition from '../assets/photos/baguette-tradition.jpg'
import baguetteBio from '../assets/photos/baguette-bio.jpg'
import baguetteGraines from '../assets/photos/baguette-graines.jpg'
import baguetteFibres from '../assets/photos/baguette-fibres.jpg'
import painComplet from '../assets/photos/pain-complet.jpg'
import painNoir from '../assets/photos/pain-noir.jpg'
import paveFibres from '../assets/photos/pave-fibres.jpg'

// --- Infos de la boulangerie ---
export const bakery = {
  nom: 'La Pétrie',
  slogan: 'Artisan boulanger depuis 2012',
  equipe: 'Sandra & Johnatan',
  adresse: '164 Avenue Jean Jaurès',
  ville: '51100 Reims',
  // Temps moyen de préparation affiché en accueil (en minutes)
  tempsPreparation: 15,
  // Note réelle relevée sur boulangerie.contact (fiche "La Pétrie Johnatan et Sandra")
  note: 4.5,
  nombreAvis: 172,
  // Présentation de la boulangerie (inspirée du site officiel lapetrie.fr)
  description:
    'Le pain est pétri et cuit sur place, toute la journée. Notre mission : redonner au pain toute sa place à table, avec des recettes originales et un fondant incomparable.',
  // Horaires d'ouverture par jour
  horaires: [
    { jour: 'Lundi', heures: '07:00 – 19:30' },
    { jour: 'Mardi', heures: '07:00 – 19:30' },
    { jour: 'Mercredi', heures: '07:00 – 19:30' },
    { jour: 'Jeudi', heures: '07:00 – 19:30' },
    { jour: 'Vendredi', heures: '07:00 – 19:30' },
    { jour: 'Samedi', heures: '07:00 – 19:30' },
    { jour: 'Dimanche', heures: '07:30 – 14:00' },
  ],
}

// Ouvert en ce moment ? Calculé avec les vrais horaires du jour.
export function estOuvertMaintenant(maintenant = new Date()) {
  const jourJS = maintenant.getDay() // 0 = dimanche, notre tableau commence lundi
  const { heures } = bakery.horaires[jourJS === 0 ? 6 : jourJS - 1]
  const bornes = heures.match(/(\d{1,2}):(\d{2})\s*–\s*(\d{1,2}):(\d{2})/)
  if (!bornes) return false
  const minutes = maintenant.getHours() * 60 + maintenant.getMinutes()
  const ouverture = Number(bornes[1]) * 60 + Number(bornes[2])
  const fermeture = Number(bornes[3]) * 60 + Number(bornes[4])
  return minutes >= ouverture && minutes < fermeture
}

// --- Vrais avis clients (relevés sur la fiche publique boulangerie.contact) ---
export const avisClients = [
  {
    auteur: 'Bruno',
    note: 5,
    texte: 'Le pain y est absolument excellent. Je recommande à 100 % !',
  },
  {
    auteur: 'Karine',
    note: 5,
    texte: 'Pains excellents et les boulangers et vendeuses sont au top !',
  },
  {
    auteur: 'Rose',
    note: 4,
    texte: 'J’aime bien cette petite boulangerie, le personnel est très agréable.',
  },
]

// Lien "Itinéraire" vers Google Maps (s'ouvre dans l'app Plans sur mobile).
// On précise "Boulangerie ... Johnatan et Sandra" pour ne pas être confondu
// avec La Pétrisane, l'autre boulangerie de l'avenue Jean Jaurès.
export const lienItineraire =
  'https://www.google.com/maps/dir/?api=1&destination=' +
  encodeURIComponent(`Boulangerie La Pétrie Johnatan et Sandra, ${bakery.adresse}, ${bakery.ville}`)

// Lien "Laisser un avis" : ouvre la fiche Google de la boutique,
// où le client peut noter et écrire son avis.
export const lienAvisGoogle =
  'https://www.google.com/maps/search/?api=1&query=' +
  encodeURIComponent(`Boulangerie La Pétrie Johnatan et Sandra, ${bakery.adresse}, ${bakery.ville}`)

// --- Catégories (issues du cahier des charges) ---
// Chaque catégorie a un emoji, un dégradé de couleurs, et une liste de
// sous-catégories. Le boulanger peut ajouter/supprimer catégories et sous-catégories.
export const categoriesInitiales = [
  { id: 'pains', nom: 'Baguettes', emoji: '🥖', from: '#e9b872', to: '#c98a3a', image: baguetteTradition, sousCategories: ['Pétrisane', 'Baguettes'] },
  { id: 'pains-speciaux', nom: 'Pains spéciaux', emoji: '🍞', from: '#d9a05b', to: '#a86a2c', image: painComplet, sousCategories: ['Pains ronds'] },
]

// --- Produits (100% pain) ---
// "stock" = quantité restante. Un produit est "disponible" tant que stock > 0.
export const productsInitiaux = [
  {
    id: 1,
    nom: 'La Pétrisane',
    categorie: 'pains',
    sousCategorie: 'Pétrisane',
    prix: 1.35,
    emoji: '🥖',
    from: '#e9b872',
    to: '#c98a3a',
    image: baguetteTradition,
    description:
      '300 g de plaisir à la saveur unique et au fondant incomparable. Elle accompagne tous vos repas, du petit déjeuner au dîner.',
    ingredients: ['Farine de blé T65', 'Eau', 'Levain naturel', 'Sel'],
    allergenes: ['Gluten'],
    delaiPreparation: 10,
    stock: 40,
    populaire: true,
    nouveau: false,
  },
  {
    id: 2,
    nom: 'Pétrisane Bio',
    categorie: 'pains',
    sousCategorie: 'Pétrisane',
    prix: 1.35,
    emoji: '🥖',
    from: '#8fae4a',
    to: '#5f8a2c',
    image: baguetteBio,
    description:
      '300 g de plaisir confectionnés exclusivement à partir de blé biologique. La Pétrisane version bio, au goût franc et authentique.',
    ingredients: ['Farine de blé bio', 'Eau', 'Levain naturel', 'Sel'],
    allergenes: ['Gluten'],
    delaiPreparation: 10,
    stock: 25,
    populaire: false,
    nouveau: true,
  },
  {
    id: 3,
    nom: 'La Pétrisane Graines',
    categorie: 'pains',
    sousCategorie: 'Pétrisane',
    prix: 1.35,
    emoji: '🌾',
    from: '#d9a05b',
    to: '#a86a2c',
    image: baguetteGraines,
    description:
      'La Pétrisane agrémentée de savoureuses graines de lin, de tournesol et de sésame, pour un croquant et des notes de noisette. 300 g.',
    ingredients: ['Farine de blé', 'Graines de lin', 'Sésame', 'Tournesol', 'Levain', 'Sel'],
    allergenes: ['Gluten', 'Sésame'],
    delaiPreparation: 10,
    stock: 20,
    populaire: true,
    nouveau: false,
  },
  {
    id: 4,
    nom: 'La Pétrisane Fibres',
    categorie: 'pains',
    sousCategorie: 'Pétrisane',
    prix: 1.35,
    emoji: '🥖',
    from: '#e08a3c',
    to: '#b45309',
    image: baguetteFibres,
    description:
      'Moelleuse, aux enveloppes de blé biologique, elle allie goût et bien-être. Riche en fibres, la complice du quotidien. 300 g.',
    ingredients: ['Farine de blé', 'Son de blé', 'Eau', 'Levain', 'Sel'],
    allergenes: ['Gluten'],
    delaiPreparation: 10,
    stock: 18,
    populaire: false,
    nouveau: true,
  },
  {
    id: 7,
    nom: 'Baguette ordinaire',
    categorie: 'pains',
    sousCategorie: 'Baguettes',
    prix: 1.2,
    emoji: '🥖',
    from: '#e9b872',
    to: '#c98a3a',
    image: baguetteOrdinaire,
    description:
      'La classique de tous les jours : croûte fine et dorée, mie souple et légère. Simple et bien faite. 250 g.',
    ingredients: ['Farine de blé', 'Eau', 'Levure', 'Sel'],
    allergenes: ['Gluten'],
    delaiPreparation: 10,
    stock: 50,
    populaire: true,
    nouveau: false,
  },
  {
    id: 8,
    nom: 'Pain Complet',
    categorie: 'pains-speciaux',
    sousCategorie: 'Pains ronds',
    prix: 2.7,
    emoji: '🍞',
    from: '#c9a06a',
    to: '#8a5a32',
    image: painComplet,
    description:
      'Farine complète, mie généreuse et goût rustique de céréale. Se garde plusieurs jours — parfait en tartines. 310 g.',
    ingredients: ['Farine de blé complète', 'Eau', 'Levain', 'Sel'],
    allergenes: ['Gluten'],
    delaiPreparation: 10,
    stock: 14,
    populaire: false,
    nouveau: true,
  },
  {
    id: 9,
    nom: 'Pain Noir',
    categorie: 'pains-speciaux',
    sousCategorie: 'Pains ronds',
    prix: 2.5,
    emoji: '🍞',
    from: '#8a5a32',
    to: '#5a3a1e',
    image: painNoir,
    description:
      'Seigle et graines torréfiées : une mie sombre, dense et parfumée, au caractère affirmé. L’allié des fromages et du saumon. 300 g.',
    ingredients: ['Farine de seigle', 'Farine de blé', 'Graines', 'Levain', 'Sel'],
    allergenes: ['Gluten', 'Sésame'],
    delaiPreparation: 10,
    stock: 10,
    populaire: false,
    nouveau: true,
  },
  {
    id: 10,
    nom: 'Pavé Fibres',
    categorie: 'pains-speciaux',
    sousCategorie: 'Pains ronds',
    prix: 2.5,
    emoji: '🍞',
    from: '#e08a3c',
    to: '#b45309',
    image: paveFibres,
    description:
      'Croûte épaisse bien cuite, mie moelleuse et riche en fibres. Le pavé qui accompagne tous les repas. 300 g.',
    ingredients: ['Farine de blé', 'Son de blé', 'Eau', 'Levain', 'Sel'],
    allergenes: ['Gluten'],
    delaiPreparation: 10,
    stock: 12,
    populaire: false,
    nouveau: true,
  },
]

// --- Commandes de démonstration (côté boulanger) ---
// Chaque commande appartient à un créneau de retrait et a un statut.
// Statuts possibles : 'a-preparer' -> 'prete' -> 'livree'
export const commandesInitiales = [
  {
    id: 1,
    numero: 'A12',
    creneau: '11:30',
    statut: 'a-preparer',
    articles: [
      { nom: 'La Pétrisane', quantite: 2, remarque: 'Bien cuites s’il vous plaît' },
      { nom: 'La Pétrisane Graines', quantite: 1 },
    ],
    total: 4.05,
    arrive: false,
  },
  {
    id: 2,
    numero: 'A13',
    creneau: '11:30',
    statut: 'a-preparer',
    articles: [{ nom: 'La Pétrisane Fibres', quantite: 2, remarque: 'Pas trop cuites' }],
    total: 2.7,
    arrive: false,
  },
  {
    id: 3,
    numero: 'A14',
    creneau: '11:45',
    statut: 'a-preparer',
    articles: [
      { nom: 'Pain Complet', quantite: 1, remarque: 'Tranché, merci !' },
      { nom: 'Pétrisane Bio', quantite: 2 },
    ],
    total: 5.4,
    arrive: false,
  },
  {
    id: 4,
    numero: 'A15',
    creneau: '12:00',
    statut: 'a-preparer',
    articles: [
      { nom: 'La Pétrisane', quantite: 3 },
    ],
    total: 4.05,
    arrive: false,
  },
  {
    id: 5,
    numero: 'A11',
    creneau: '11:15',
    statut: 'prete',
    articles: [{ nom: 'Pain Noir', quantite: 1 }],
    total: 2.5,
    arrive: true, // ce client a signalé son arrivée en boutique
  },
]
