// Teste la pause du fournil : active 30 min, relit, puis annule.
// Lancer : PP_EMAIL=... PP_MDP=... node supabase/test-pause.mjs
import { createClient } from '@supabase/supabase-js'

const sb = createClient('https://utxqtsasdygyrddyhogu.supabase.co', 'sb_publishable_YuZN7MNNlsBpiKugzW07GA_fNXKoMa4')
const { error: e1 } = await sb.auth.signInWithPassword({ email: process.env.PP_EMAIL, password: process.env.PP_MDP })
if (e1) { console.error('Connexion:', e1.message); process.exit(1) }

const fin = new Date(Date.now() + 30 * 60000).toISOString()
const { error: e2 } = await sb.from('reglages').update({ pause_jusqua: fin }).eq('id', 1)
console.log('1. Pause activee :', e2 ? 'ERREUR ' + e2.message : 'OK')

const { data } = await sb.from('reglages').select('*').eq('id', 1).maybeSingle()
console.log('2. Lue cote client :', data?.pause_jusqua ? 'OK (' + data.pause_jusqua + ')' : 'ABSENTE')

const { error: e3 } = await sb.from('reglages').update({ pause_jusqua: null }).eq('id', 1)
console.log('3. Reprise :', e3 ? 'ERREUR ' + e3.message : 'OK (pause annulee)')
