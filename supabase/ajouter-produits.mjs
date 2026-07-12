// Ajoute les nouvelles catégories (Viennoiseries, Gourmandises) et 7 produits
// (croissant, pain au chocolat, chouquettes, cookie, pétrie choc/fruits, croûtons)
// avec leurs photos en base64. Idempotent : ne réinsère pas un produit déjà présent.
//
// Lancer :  PP_EMAIL=... PP_MDP=... node supabase/ajouter-produits.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const URL = 'https://utxqtsasdygyrddyhogu.supabase.co'
const ANON = 'sb_publishable_YuZN7MNNlsBpiKugzW07GA_fNXKoMa4'
const PHOTOS = '/private/tmp/claude-501/-Users-mathismiddendorp/fb1ac9e1-0904-4194-8c52-690870bdea33/scratchpad/photos'

const img = (key) =>
  'data:image/jpeg;base64,' + readFileSync(`${PHOTOS}/${key}.jpg`).toString('base64')

const categories = [
  { id: 'viennoiseries', nom: 'Viennoiseries', emoji: '🥐', couleur_from: '#e6b980', couleur_to: '#c98a3a', image: null, sous_categories: ['Viennoiseries'], ordre: 3 },
  { id: 'gourmandises', nom: 'Gourmandises', emoji: '🍪', couleur_from: '#e0a9b6', couleur_to: '#a13352', image: null, sous_categories: ['Douceurs'], ordre: 4 },
]

const produits = [
  { nom: 'Croissant', categorie: 'viennoiseries', sous_categorie: 'Viennoiseries', prix: 1.20, emoji: '🥐', image: img('croissant'), description: 'Croissant pur beurre, feuilleté et doré, cuit chaque matin.', delai_preparation: 5, stock: 30 },
  { nom: 'Pain au chocolat', categorie: 'viennoiseries', sous_categorie: 'Viennoiseries', prix: 1.30, emoji: '🥐', image: img('pain-chocolat'), description: 'Viennoiserie feuilletée pur beurre avec deux barres de chocolat.', delai_preparation: 5, stock: 30 },
  { nom: 'Chouquettes (×6)', categorie: 'gourmandises', sous_categorie: 'Douceurs', prix: 1.00, emoji: '🧁', image: img('chouquettes'), description: 'Petits choux légers perlés de sucre. Sachet de 6.', delai_preparation: 5, stock: 20 },
  { nom: 'Cookie 3 chocolats', categorie: 'gourmandises', sous_categorie: 'Douceurs', prix: 2.05, emoji: '🍪', image: img('cookie'), description: 'Grand cookie moelleux aux trois chocolats.', delai_preparation: 5, stock: 20 },
  { nom: 'Pétrie choc (×5)', categorie: 'gourmandises', sous_categorie: 'Douceurs', prix: 2.00, emoji: '🍫', image: img('petrie-choc'), description: 'Petits pains briochés aux pépites de chocolat. Par 5.', delai_preparation: 5, stock: 20 },
  { nom: 'Pétrie fruits (×5)', categorie: 'gourmandises', sous_categorie: 'Douceurs', prix: 2.00, emoji: '🍇', image: img('petrie-fruits'), description: 'Petits pains briochés aux raisins et fruits. Par 5.', delai_preparation: 5, stock: 20 },
  { nom: 'Croûtons apéritif', categorie: 'pains-speciaux', sous_categorie: 'Apéritif', prix: 1.50, emoji: '🥖', image: img('croutons'), description: 'Croûtons de pain grillés, parfaits à l’apéritif. Le sachet.', delai_preparation: 5, stock: 15 },
]

const sb = createClient(URL, ANON)

const { error: authErr } = await sb.auth.signInWithPassword({
  email: process.env.PP_EMAIL,
  password: process.env.PP_MDP,
})
if (authErr) { console.error('Connexion échouée:', authErr.message); process.exit(1) }
console.log('Connecté en boulanger ✓')

// 1) Catégories (upsert idempotent)
const { error: catErr } = await sb.from('categories').upsert(categories, { onConflict: 'id' })
console.log(catErr ? 'Catégories: ERREUR ' + catErr.message : 'Catégories: OK (Viennoiseries + Gourmandises)')

// 2) Produits (on saute ceux déjà présents par nom)
const { data: existants } = await sb.from('produits').select('nom')
const noms = new Set((existants || []).map((p) => p.nom))
const aInserer = produits.filter((p) => !noms.has(p.nom))
if (aInserer.length === 0) {
  console.log('Produits: tous déjà présents, rien à faire.')
} else {
  const { data, error } = await sb.from('produits').insert(aInserer).select('id,nom,prix,categorie')
  if (error) { console.error('Produits: ERREUR', error.message); process.exit(1) }
  console.log(`Produits: ${data.length} ajoutés`)
  data.forEach((p) => console.log(`  #${p.id} ${p.nom} — ${p.prix}€ (${p.categorie})`))
}
console.log('Terminé.')
