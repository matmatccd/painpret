// Remplit la table "categories" avec les catégories de départ (accents propres).
// Usage : PP_EMAIL=... PP_MDP=... node supabase/seed-categories.mjs
import { createClient } from '@supabase/supabase-js'
import { categoriesInitiales } from '../src/data/bakery.js'

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

for (const [i, c] of categoriesInitiales.entries()) {
  const { error } = await supabase.from('categories').upsert({
    id: c.id,
    nom: c.nom,
    emoji: c.emoji ?? '',
    couleur_from: c.from,
    couleur_to: c.to,
    image: c.image ?? null,
    sous_categories: c.sousCategories ?? [],
    ordre: i,
  })
  console.log(error ? `❌ ${c.id} ${error.message}` : `✅ ${c.id} ${c.nom}`)
}
process.exit(0)
