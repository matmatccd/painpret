// Supprime UNE commande précise (par numéro) et restaure son stock.
// Connexion boulanger requise (seul le boulanger peut modifier/supprimer).
// Lancer : PP_EMAIL=... PP_MDP=... node supabase/supprimer-commande.mjs B100
import { createClient } from '@supabase/supabase-js'

const numero = process.argv[2]
if (!numero) { console.error('Usage: node supprimer-commande.mjs <NUMERO>'); process.exit(1) }

const sb = createClient('https://utxqtsasdygyrddyhogu.supabase.co', 'sb_publishable_YuZN7MNNlsBpiKugzW07GA_fNXKoMa4')
const { error: e1 } = await sb.auth.signInWithPassword({ email: process.env.PP_EMAIL, password: process.env.PP_MDP })
if (e1) { console.error('Connexion:', e1.message); process.exit(1) }

const { data: cmd } = await sb.from('commandes').select('id,numero,articles').eq('numero', numero).maybeSingle()
if (!cmd) { console.log('Commande ' + numero + ' introuvable (deja supprimee ?)'); process.exit(0) }

for (const a of cmd.articles || []) {
  if (!a.produitId) continue
  const { data: p } = await sb.from('produits').select('stock,nom').eq('id', a.produitId).maybeSingle()
  if (p) {
    await sb.from('produits').update({ stock: (p.stock || 0) + (a.quantite || 0) }).eq('id', a.produitId)
    console.log('  stock restaure : ' + p.nom + ' +' + (a.quantite || 0) + ' -> ' + ((p.stock || 0) + (a.quantite || 0)))
  }
}
const { error } = await sb.from('commandes').delete().eq('id', cmd.id)
console.log(error ? 'ERREUR ' + error.message : 'Commande ' + numero + ' supprimee.')
