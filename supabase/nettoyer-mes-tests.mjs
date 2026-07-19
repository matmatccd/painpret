// Supprime UNIQUEMENT les commandes dont le client commence par "TEST "
// (celles créées par les scripts de vérification) et restaure leur stock.
// Les vraies commandes ne sont jamais touchées.
// Lancer : PP_EMAIL=... PP_MDP=... node supabase/nettoyer-mes-tests.mjs
import { createClient } from '@supabase/supabase-js'

const sb = createClient('https://utxqtsasdygyrddyhogu.supabase.co', 'sb_publishable_YuZN7MNNlsBpiKugzW07GA_fNXKoMa4')
const { error: e1 } = await sb.auth.signInWithPassword({ email: process.env.PP_EMAIL, password: process.env.PP_MDP })
if (e1) { console.error('Connexion:', e1.message); process.exit(1) }

const { data: cmds } = await sb.from('commandes').select('id,numero,client,articles').like('client', 'TEST %')
if (!cmds?.length) { console.log('Aucune commande de test a supprimer.'); process.exit(0) }

const restock = new Map()
for (const c of cmds) {
  for (const a of c.articles || []) {
    if (a.produitId) restock.set(a.produitId, (restock.get(a.produitId) || 0) + (a.quantite || 0))
  }
}
for (const [id, qte] of restock) {
  const { data: p } = await sb.from('produits').select('stock,nom').eq('id', id).maybeSingle()
  if (p) {
    await sb.from('produits').update({ stock: (p.stock || 0) + qte }).eq('id', id)
    console.log(`  stock restaure : ${p.nom} +${qte} -> ${(p.stock || 0) + qte}`)
  }
}
const { error } = await sb.from('commandes').delete().in('id', cmds.map((c) => c.id))
console.log(error ? 'ERREUR ' + error.message : `${cmds.length} commande(s) de test supprimee(s) : ${cmds.map((c) => c.numero).join(', ')}`)
