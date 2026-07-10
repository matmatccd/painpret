// ============================================================
//  PainPrêt — Données factices (mock data)
//  -----------------------------------------------------------
//  Pour le MVP, une seule boulangerie : La Pétrie.
//  Ces données sont "en dur" pour construire l'interface.
//  Plus tard, elles viendront d'une vraie base de données (Supabase).
// ============================================================


// --- Infos de la boulangerie ---
export const bakery = {
  nom: 'La Pétrie',
  slogan: 'Artisan boulanger depuis 2012',
  equipe: 'Sandra & Johnatan',
  adresse: '164 Avenue Jean Jaurès',
  ville: '51100 Reims',
  telephone: '03 26 02 76 28',
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
  { id: 'pains', nom: 'Baguettes', emoji: '🥖', from: '#e9b872', to: '#c98a3a', image: 'baguette-tradition', sousCategories: ['Pétrisane', 'Baguettes'] },
  { id: 'pains-speciaux', nom: 'Pains spéciaux', emoji: '🍞', from: '#d9a05b', to: '#a86a2c', image: 'pain-complet', sousCategories: ['Pains ronds', 'Brioches'] },
  { id: 'boissons', nom: 'Boissons', emoji: '🥤', from: '#e05252', to: '#a32222', image: 'coca-bouteille', sousCategories: ['Sodas', 'Jus', 'Eaux'] },
]

// Un jour en millisecondes (pour les dates de mise en ligne)
const JOUR = 24 * 60 * 60 * 1000

// --- Produits ---
// "stock" = quantité restante. Un produit est "disponible" tant que stock > 0.
export const productsInitiaux = [
  {
    id: 1,
    creeLe: Date.now() - 30 * JOUR,
    nom: 'La Pétrisane',
    categorie: 'pains',
    sousCategorie: 'Pétrisane',
    prix: 1.35,
    emoji: '🥖',
    from: '#e9b872',
    to: '#c98a3a',
    image: 'baguette-tradition',
    description:
      '300 g de plaisir à la saveur unique et au fondant incomparable. Elle accompagne tous vos repas, du petit déjeuner au dîner.',
    ingredients: ['Farine de blé T65', 'Eau', 'Levain naturel', 'Sel'],
    allergenes: ['Gluten'],
    delaiPreparation: 10,
    stock: 40,
    populaire: true,
  },
  {
    id: 2,
    creeLe: Date.now() - 30 * JOUR,
    nom: 'Pétrisane Bio',
    categorie: 'pains',
    sousCategorie: 'Pétrisane',
    prix: 1.35,
    emoji: '🥖',
    from: '#8fae4a',
    to: '#5f8a2c',
    image: 'baguette-bio',
    description:
      '300 g de plaisir confectionnés exclusivement à partir de blé biologique. La Pétrisane version bio, au goût franc et authentique.',
    ingredients: ['Farine de blé bio', 'Eau', 'Levain naturel', 'Sel'],
    allergenes: ['Gluten'],
    delaiPreparation: 10,
    stock: 25,
    populaire: false,
  },
  {
    id: 3,
    creeLe: Date.now() - 30 * JOUR,
    nom: 'La Pétrisane Graines',
    categorie: 'pains',
    sousCategorie: 'Pétrisane',
    prix: 1.35,
    emoji: '🌾',
    from: '#d9a05b',
    to: '#a86a2c',
    image: 'baguette-graines',
    description:
      'La Pétrisane agrémentée de savoureuses graines de lin, de tournesol et de sésame, pour un croquant et des notes de noisette. 300 g.',
    ingredients: ['Farine de blé', 'Graines de lin', 'Sésame', 'Tournesol', 'Levain', 'Sel'],
    allergenes: ['Gluten', 'Sésame'],
    delaiPreparation: 10,
    stock: 20,
    populaire: true,
  },
  {
    id: 4,
    creeLe: Date.now() - 30 * JOUR,
    nom: 'La Pétrisane Fibres',
    categorie: 'pains',
    sousCategorie: 'Pétrisane',
    prix: 1.35,
    emoji: '🥖',
    from: '#e08a3c',
    to: '#b45309',
    image: 'baguette-fibres',
    description:
      'Moelleuse, aux enveloppes de blé biologique, elle allie goût et bien-être. Riche en fibres, la complice du quotidien. 300 g.',
    ingredients: ['Farine de blé', 'Son de blé', 'Eau', 'Levain', 'Sel'],
    allergenes: ['Gluten'],
    delaiPreparation: 10,
    stock: 18,
    populaire: false,
  },
  {
    id: 7,
    creeLe: Date.now() - 30 * JOUR,
    nom: 'Baguette ordinaire',
    categorie: 'pains',
    sousCategorie: 'Baguettes',
    prix: 1.2,
    emoji: '🥖',
    from: '#e9b872',
    to: '#c98a3a',
    image: 'baguette-ordinaire',
    description:
      'La classique de tous les jours : croûte fine et dorée, mie souple et légère. Simple et bien faite. 250 g.',
    ingredients: ['Farine de blé', 'Eau', 'Levure', 'Sel'],
    allergenes: ['Gluten'],
    delaiPreparation: 10,
    stock: 50,
    populaire: true,
  },
  {
    id: 8,
    creeLe: Date.now() - 30 * JOUR,
    nom: 'Pain Complet',
    categorie: 'pains-speciaux',
    sousCategorie: 'Pains ronds',
    prix: 2.7,
    emoji: '🍞',
    from: '#c9a06a',
    to: '#8a5a32',
    image: 'pain-complet',
    description:
      'Farine complète, mie généreuse et goût rustique de céréale. Se garde plusieurs jours — parfait en tartines. 310 g.',
    ingredients: ['Farine de blé complète', 'Eau', 'Levain', 'Sel'],
    allergenes: ['Gluten'],
    delaiPreparation: 10,
    stock: 14,
    populaire: false,
  },
  {
    id: 9,
    creeLe: Date.now() - 30 * JOUR,
    nom: 'Pain Noir',
    categorie: 'pains-speciaux',
    sousCategorie: 'Pains ronds',
    prix: 2.5,
    emoji: '🍞',
    from: '#8a5a32',
    to: '#5a3a1e',
    image: 'pain-noir',
    description:
      'Seigle et graines torréfiées : une mie sombre, dense et parfumée, au caractère affirmé. L’allié des fromages et du saumon. 300 g.',
    ingredients: ['Farine de seigle', 'Farine de blé', 'Graines', 'Levain', 'Sel'],
    allergenes: ['Gluten', 'Sésame'],
    delaiPreparation: 10,
    stock: 10,
    populaire: false,
  },
  {
    id: 10,
    creeLe: Date.now() - 30 * JOUR,
    nom: 'Pavé Fibres',
    categorie: 'pains-speciaux',
    sousCategorie: 'Pains ronds',
    prix: 2.5,
    emoji: '🍞',
    from: '#e08a3c',
    to: '#b45309',
    image: 'pave-fibres',
    description:
      'Croûte épaisse bien cuite, mie moelleuse et riche en fibres. Le pavé qui accompagne tous les repas. 300 g.',
    ingredients: ['Farine de blé', 'Son de blé', 'Eau', 'Levain', 'Sel'],
    allergenes: ['Gluten'],
    delaiPreparation: 10,
    stock: 12,
    populaire: false,
  },
  {
    id: 11,
    creeLe: Date.now() - 1 * JOUR,
    nom: 'Brioche',
    categorie: 'pains-speciaux',
    sousCategorie: 'Brioches',
    prix: 4.5,
    emoji: '🥮',
    from: '#f2c464',
    to: '#d99a2b',
    image: 'brioche',
    description:
      'Brioche pur beurre cuite dans son moule : mie filante, croûte dorée et parfum gourmand. Parfaite au petit déjeuner ou au goûter.',
    ingredients: ['Farine de blé', 'Œufs', 'Beurre', 'Sucre', 'Levure', 'Sel'],
    allergenes: ['Gluten', 'Œufs', 'Lait'],
    delaiPreparation: 10,
    stock: 8,
    populaire: false,
  },
  // --- Boissons fraîches (aucune préparation nécessaire) ---
  {
    id: 12,
    creeLe: Date.now() - 5 * JOUR,
    nom: 'Coca-Cola 33 cl',
    categorie: 'boissons',
    sousCategorie: 'Sodas',
    prix: 1.5,
    emoji: '🥤',
    from: '#e05252',
    to: '#a32222',
    image: 'coca-canette',
    description: 'La canette classique, bien fraîche — le goût original.',
    allergenes: [],
    stock: 24,
    populaire: true,
  },
  {
    id: 13,
    creeLe: Date.now() - 5 * JOUR,
    nom: 'Coca-Cola Zéro 33 cl',
    categorie: 'boissons',
    sousCategorie: 'Sodas',
    prix: 1.5,
    emoji: '🥤',
    from: '#3a3a3a',
    to: '#111111',
    image: 'coca-zero-canette',
    description: 'Le goût Coca-Cola, zéro sucres — en canette fraîche.',
    allergenes: [],
    stock: 24,
    populaire: false,
  },
  {
    id: 14,
    creeLe: Date.now() - 5 * JOUR,
    nom: 'Coca-Cola 50 cl',
    categorie: 'boissons',
    sousCategorie: 'Sodas',
    prix: 2,
    emoji: '🥤',
    from: '#e05252',
    to: '#a32222',
    image: 'coca-bouteille',
    description: 'La bouteille 50 cl à emporter — goût original.',
    allergenes: [],
    stock: 18,
    populaire: false,
  },
  {
    id: 15,
    creeLe: Date.now() - 5 * JOUR,
    nom: 'Coca-Cola Zéro 50 cl',
    categorie: 'boissons',
    sousCategorie: 'Sodas',
    prix: 2,
    emoji: '🥤',
    from: '#3a3a3a',
    to: '#111111',
    image: 'coca-zero-bouteille',
    description: 'La bouteille 50 cl zéro sucres, sans calories.',
    allergenes: [],
    stock: 18,
    populaire: false,
  },
  {
    id: 16,
    creeLe: Date.now() - 5 * JOUR,
    nom: 'Orangina 50 cl',
    categorie: 'boissons',
    sousCategorie: 'Sodas',
    prix: 2,
    emoji: '🍊',
    from: '#f2a444',
    to: '#d97b16',
    image: 'orangina',
    description: 'La bulle à l’orange… et sa pulpe ! Bouteille 50 cl.',
    allergenes: [],
    stock: 15,
    populaire: false,
  },
  {
    id: 17,
    creeLe: Date.now() - 5 * JOUR,
    nom: 'Oasis Tropical 33 cl',
    categorie: 'boissons',
    sousCategorie: 'Jus',
    prix: 1.5,
    emoji: '🌴',
    from: '#f2a444',
    to: '#2f7fbf',
    image: 'oasis-tropical',
    description: 'À l’eau de source et aux fruits, saveur tropicale. 33 cl.',
    allergenes: [],
    stock: 15,
    populaire: false,
  },
  {
    id: 18,
    creeLe: Date.now() - 5 * JOUR,
    nom: 'Lipton Ice Tea Pêche 50 cl',
    categorie: 'boissons',
    sousCategorie: 'Sodas',
    prix: 2,
    emoji: '🍑',
    from: '#f2b05e',
    to: '#c96a1a',
    image: 'lipton-peche',
    description: 'Thé glacé saveur pêche, faible en calories. Bouteille 50 cl.',
    allergenes: [],
    stock: 15,
    populaire: false,
  },
  {
    id: 19,
    creeLe: Date.now() - 5 * JOUR,
    nom: 'Minute Maid Orange 33 cl',
    categorie: 'boissons',
    sousCategorie: 'Jus',
    prix: 1.5,
    emoji: '🍊',
    from: '#f2a444',
    to: '#d97b16',
    image: 'minute-maid',
    description: 'Jus à teneur en fruits, riche en vitamine C. Canette 33 cl.',
    allergenes: [],
    stock: 15,
    populaire: false,
  },
  {
    id: 20,
    creeLe: Date.now() - 5 * JOUR,
    nom: 'Cristaline 50 cl',
    categorie: 'boissons',
    sousCategorie: 'Eaux',
    prix: 1,
    emoji: '💧',
    from: '#7fb8e0',
    to: '#2f6fa8',
    image: 'cristaline',
    description: 'Eau de source à l’état naturel, fabriquée en France. 50 cl.',
    allergenes: [],
    stock: 30,
    populaire: false,
  },
  {
    id: 21,
    creeLe: Date.now() - 5 * JOUR,
    nom: 'San Pellegrino 50 cl',
    categorie: 'boissons',
    sousCategorie: 'Eaux',
    prix: 1.5,
    emoji: '🫧',
    from: '#7fd0a0',
    to: '#2f8a5a',
    image: 'san-pellegrino',
    description: 'Eau minérale naturelle finement pétillante. Bouteille 50 cl.',
    allergenes: [],
    stock: 20,
    populaire: false,
  },
]

// --- Commandes de démonstration (côté boulanger) ---
// Chaque commande appartient à un créneau de retrait et a un statut.
// Statuts possibles : 'a-preparer' -> 'prete' -> 'livree'
export const commandesInitiales = [
  {
    id: 1,
    numero: 'A12',
    client: 'Julie',
    date: Date.now(),
    creneau: '11:30',
    statut: 'a-preparer',
    articles: [
      { nom: 'La Pétrisane', quantite: 2, prix: 1.35, remarque: 'Bien cuites s’il vous plaît' },
      { nom: 'La Pétrisane Graines', quantite: 1, prix: 1.35 },
    ],
    total: 4.05,
    arrive: false,
  },
  {
    id: 2,
    numero: 'A13',
    client: 'Marc',
    date: Date.now(),
    creneau: '11:30',
    statut: 'a-preparer',
    articles: [{ nom: 'La Pétrisane Fibres', quantite: 2, prix: 1.35, remarque: 'Pas trop cuites' }],
    total: 2.7,
    arrive: false,
  },
  {
    id: 3,
    numero: 'A14',
    client: 'Nadia',
    date: Date.now(),
    creneau: '11:45',
    statut: 'a-preparer',
    articles: [
      { nom: 'Pain Complet', quantite: 1, prix: 2.7, remarque: 'Tranché, merci !' },
      { nom: 'Pétrisane Bio', quantite: 2, prix: 1.35 },
    ],
    total: 5.4,
    arrive: false,
  },
  {
    id: 4,
    numero: 'A15',
    client: 'Paul',
    date: Date.now(),
    creneau: '12:00',
    statut: 'a-preparer',
    articles: [
      { nom: 'La Pétrisane', quantite: 3, prix: 1.35 },
    ],
    total: 4.05,
    arrive: false,
  },
  {
    id: 5,
    numero: 'A11',
    client: 'Sophie',
    date: Date.now(),
    creneau: '11:15',
    statut: 'prete',
    articles: [{ nom: 'Pain Noir', quantite: 1, prix: 2.5 }],
    total: 2.5,
    arrive: true, // ce client a signalé son arrivée en boutique
  },
]
