// Met le délai de préparation des BOISSONS à 0 (elles sont déjà prêtes,
// donc plus de "~10 min" affiché). Lancer : PP_EMAIL=... PP_MDP=... node ...
import { createClient } from '@supabase/supabase-js'
const sb = createClient('https://utxqtsasdygyrddyhogu.supabase.co', 'sb_publishable_YuZN7MNNlsBpiKugzW07GA_fNXKoMa4')
const { error: e1 } = await sb.auth.signInWithPassword({ email: process.env.PP_EMAIL, password: process.env.PP_MDP })
if (e1) { console.error('Connexion:', e1.message); process.exit(1) }
const { data, error } = await sb.from('produits').update({ delai_preparation: 0 }).eq('categorie', 'boissons').select('id,nom')
if (error) { console.error(error.message); process.exit(1) }
console.log(`Boissons mises à 0 min : ${data.length} produits`)
