// Change le mot de passe (= code d'accès) du compte boulanger.
// Lancer : PP_EMAIL=... PP_MDP=<ancien> PP_NOUVEAU=<nouveau code> node ...
import { createClient } from '@supabase/supabase-js'
const sb = createClient('https://utxqtsasdygyrddyhogu.supabase.co', 'sb_publishable_YuZN7MNNlsBpiKugzW07GA_fNXKoMa4')
const { error: e1 } = await sb.auth.signInWithPassword({ email: process.env.PP_EMAIL, password: process.env.PP_MDP })
if (e1) { console.error('Connexion (ancien mdp):', e1.message); process.exit(1) }
const { error: e2 } = await sb.auth.updateUser({ password: process.env.PP_NOUVEAU })
if (e2) { console.error('Changement:', e2.message); process.exit(1) }
console.log('Nouveau code boulanger défini ✓')
