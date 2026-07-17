// Remplace les photos des 7 produits uploadés (et des 2 catégories)
// par des versions HAUTE DÉFINITION (1000px) — nettes sur écrans Retina.
// Lancer : PP_EMAIL=... PP_MDP=... node supabase/maj-photos-hd.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const PHOTOS = '/private/tmp/claude-501/-Users-mathismiddendorp/fb1ac9e1-0904-4194-8c52-690870bdea33/scratchpad/photos-hd'
const img = (k) => 'data:image/jpeg;base64,' + readFileSync(`${PHOTOS}/${k}.jpg`).toString('base64')

const sb = createClient('https://utxqtsasdygyrddyhogu.supabase.co', 'sb_publishable_YuZN7MNNlsBpiKugzW07GA_fNXKoMa4')
const { error: e1 } = await sb.auth.signInWithPassword({ email: process.env.PP_EMAIL, password: process.env.PP_MDP })
if (e1) { console.error('Connexion:', e1.message); process.exit(1) }

const produits = [
  ['Croissant', 'croissant'],
  ['Pain au chocolat', 'pain-chocolat'],
  ['Chouquettes (×6)', 'chouquettes'],
  ['Cookie 3 chocolats', 'cookie'],
  ['Pétrie choc (×5)', 'petrie-choc'],
  ['Pétrie fruits (×5)', 'petrie-fruits'],
  ['Croûtons apéritif', 'croutons'],
]
for (const [nom, cle] of produits) {
  const { error } = await sb.from('produits').update({ image: img(cle) }).eq('nom', nom)
  console.log(nom, error ? 'ERREUR ' + error.message : 'HD OK')
}
for (const [id, cle] of [['viennoiseries', 'croissant'], ['gourmandises', 'cookie']]) {
  const { error } = await sb.from('categories').update({ image: img(cle) }).eq('id', id)
  console.log('catégorie ' + id, error ? 'ERREUR ' + error.message : 'HD OK')
}
