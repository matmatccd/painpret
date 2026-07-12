// Nettoie les commandes de TEST : restaure le stock des produits commandés,
// supprime les commandes et les commandes_en_attente.
// Lancer : PP_EMAIL=... PP_MDP=010507 node supabase/nettoyer-test.mjs
import { createClient } from '@supabase/supabase-js'
const sb = createClient('https://utxqtsasdygyrddyhogu.supabase.co', 'sb_publishable_YuZN7MNNlsBpiKugzW07GA_fNXKoMa4')
const { error: e1 } = await sb.auth.signInWithPassword({ email: process.env.PP_EMAIL, password: process.env.PP_MDP })
if (e1) { console.error('Connexion:', e1.message); process.exit(1) }

// 1) Lire les commandes pour restaurer le stock
const { data: cmds } = await sb.from('commandes').select('id,numero,articles')
const restock = new Map()
for (const c of cmds || []) {
  for (const a of (c.articles || [])) {
    if (a.produitId) restock.set(a.produitId, (restock.get(a.produitId) || 0) + (a.quantite || 0))
  }
}
console.log(`Commandes à supprimer : ${cmds?.length || 0}`)

// 2) Restaurer le stock produit par produit
for (const [id, qte] of restock) {
  const { data: p } = await sb.from('produits').select('stock,nom').eq('id', id).maybeSingle()
  if (p) {
    const nv = (p.stock || 0) + qte
    await sb.from('produits').update({ stock: nv }).eq('id', id)
    console.log(`  Stock restauré : ${p.nom} +${qte} -> ${nv}`)
  }
}

// 3) Supprimer commandes + commandes_en_attente
const { error: e2 } = await sb.from('commandes').delete().neq('id', 0)
const { error: e3 } = await sb.from('commandes_en_attente').delete().neq('id', 0)
console.log('Commandes supprimées :', e2 ? 'ERREUR ' + e2.message : 'OK')
console.log('En attente supprimées :', e3 ? 'ERREUR ' + e3.message : 'OK')
console.log('Nettoyage terminé.')
