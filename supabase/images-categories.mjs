// Donne une vraie photo aux catégories Viennoiseries et Gourmandises
// (elles affichaient encore un emoji faute d'image).
// Lancer : PP_EMAIL=... PP_MDP=... node supabase/images-categories.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const PHOTOS = '/private/tmp/claude-501/-Users-mathismiddendorp/fb1ac9e1-0904-4194-8c52-690870bdea33/scratchpad/photos'
const img = (k) => 'data:image/jpeg;base64,' + readFileSync(`${PHOTOS}/${k}.jpg`).toString('base64')

const sb = createClient('https://utxqtsasdygyrddyhogu.supabase.co', 'sb_publishable_YuZN7MNNlsBpiKugzW07GA_fNXKoMa4')
const { error: e1 } = await sb.auth.signInWithPassword({ email: process.env.PP_EMAIL, password: process.env.PP_MDP })
if (e1) { console.error('Connexion:', e1.message); process.exit(1) }

for (const [id, cle] of [['viennoiseries', 'croissant'], ['gourmandises', 'cookie']]) {
  const { error } = await sb.from('categories').update({ image: img(cle) }).eq('id', id)
  console.log(id, error ? 'ERREUR ' + error.message : 'image OK')
}
