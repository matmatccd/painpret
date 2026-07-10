// Répare les accents cassés dans la base (é -> √© lors du copier-coller).
// Renvoie les textes corrects depuis src/data/bakery.js, produit par produit.
// Usage : node supabase/reparer-accents.mjs
import { createClient } from '@supabase/supabase-js'
import { productsInitiaux } from '../src/data/bakery.js'

const supabase = createClient(
  'https://utxqtsasdygyrddyhogu.supabase.co',
  'sb_publishable_YuZN7MNNlsBpiKugzW07GA_fNXKoMa4',
)

const { error: errAuth } = await supabase.auth.signInWithPassword({
  email: process.env.PP_EMAIL,
  password: process.env.PP_MDP,
})
if (errAuth) {
  console.error('connexion refusée :', errAuth.message)
  process.exit(1)
}

for (const p of productsInitiaux) {
  const { error } = await supabase
    .from('produits')
    .update({
      nom: p.nom,
      description: p.description ?? '',
      sous_categorie: p.sousCategorie ?? null,
      ingredients: p.ingredients ?? [],
      allergenes: p.allergenes ?? [],
      emoji: p.emoji ?? '🥖',
    })
    .eq('id', p.id)
  console.log(error ? `❌ ${p.id} ${error.message}` : `✅ ${p.id} ${p.nom}`)
}
process.exit(0)
