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
  slogan: 'Artisan boulanger depuis 1987',
  equipe: 'Sandra & Johnatan',
  adresse: '164 Avenue Jean Jaurès',
  ville: '51100 Reims',
  // Temps moyen de préparation affiché en accueil (en minutes)
  tempsPreparation: 15,
  note: 4.8,
  nombreAvis: 326,
  // Horaires d'ouverture par jour
  horaires: [
    { jour: 'Lundi', heures: '07:00 – 20:00' },
    { jour: 'Mardi', heures: '07:00 – 20:00' },
    { jour: 'Mercredi', heures: '07:00 – 20:00' },
    { jour: 'Jeudi', heures: '07:00 – 20:00' },
    { jour: 'Vendredi', heures: '07:00 – 20:00' },
    { jour: 'Samedi', heures: '07:00 – 20:00' },
    { jour: 'Dimanche', heures: '07:30 – 13:00' },
  ],
  ouvertMaintenant: true,
}

// --- Catégories (issues du cahier des charges) ---
// Chaque catégorie a un emoji, un dégradé de couleurs, et une liste de
// sous-catégories. Le boulanger peut ajouter/supprimer catégories et sous-catégories.
export const categoriesInitiales = [
  { id: 'pains', nom: 'Baguettes', emoji: '🥖', from: '#e9b872', to: '#c98a3a', sousCategories: ['Pétrisane', 'Baguettes'] },
  { id: 'pains-speciaux', nom: 'Pains spéciaux', emoji: '🍞', from: '#d9a05b', to: '#a86a2c', sousCategories: ['Pains ronds'] },
]

// --- Produits (100% pain) ---
// "stock" = quantité restante. Un produit est "disponible" tant que stock > 0.
export const productsInitiaux = [
  {
    id: 1,
    nom: 'La Pétrisane',
    categorie: 'pains',
    sousCategorie: 'Pétrisane',
    prix: 1.25,
    emoji: '🥖',
    from: '#e9b872',
    to: '#c98a3a',
    image: baguetteTradition,
    description:
      'Notre baguette signature : pétrissage lent, longue fermentation, croûte craquante et mie crème aux arômes de levain. 300 g.',
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
    prix: 1.25,
    emoji: '🥖',
    from: '#8fae4a',
    to: '#5f8a2c',
    image: baguetteBio,
    description:
      'La Pétrisane en version bio : blé issu de l’agriculture biologique, fermentation douce, goût franc et authentique. 300 g.',
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
    prix: 1.25,
    emoji: '🌾',
    from: '#d9a05b',
    to: '#a86a2c',
    image: baguetteGraines,
    description:
      'Généreusement parée de graines torréfiées — lin, sésame, tournesol — pour un croquant et des notes de noisette uniques. 300 g.',
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
    prix: 1.25,
    emoji: '🥖',
    from: '#e08a3c',
    to: '#b45309',
    image: baguetteFibres,
    description:
      'Riche en fibres naturelles : plus rassasiante, plus digeste, tout aussi gourmande. La complice du quotidien. 300 g.',
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
    prix: 1.1,
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
      { nom: 'La Pétrisane', quantite: 2 },
      { nom: 'La Pétrisane Graines', quantite: 1 },
    ],
    total: 3.75,
    arrive: false,
  },
  {
    id: 2,
    numero: 'A13',
    creneau: '11:30',
    statut: 'a-preparer',
    articles: [{ nom: 'La Pétrisane Fibres', quantite: 2 }],
    total: 2.5,
    arrive: false,
  },
  {
    id: 3,
    numero: 'A14',
    creneau: '11:45',
    statut: 'a-preparer',
    articles: [
      { nom: 'Pain Complet', quantite: 1 },
      { nom: 'Pétrisane Bio', quantite: 2 },
    ],
    total: 5.2,
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
    total: 3.75,
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
