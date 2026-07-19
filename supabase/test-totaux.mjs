// Crée 3 commandes de test (avec des produits qui se recoupent) pour vérifier
// le récapitulatif "À sortir du four", puis propose de tout nettoyer.
// Lancer : PP_EMAIL=... PP_MDP=... node supabase/test-totaux.mjs [--nettoyer]
import { createClient } from '@supabase/supabase-js'

const sb = createClient('https://utxqtsasdygyrddyhogu.supabase.co', 'sb_publishable_YuZN7MNNlsBpiKugzW07GA_fNXKoMa4')
const { error: e1 } = await sb.auth.signInWithPassword({ email: process.env.PP_EMAIL, password: process.env.PP_MDP })
if (e1) { console.error('Connexion:', e1.message); process.exit(1) }

if (process.argv.includes('--nettoyer')) {
  const { data: cmds } = await sb.from('commandes').select('id,articles')
  const restock = new Map()
  for (const c of cmds || []) {
    for (const a of c.articles || []) {
      if (a.produitId) restock.set(a.produitId, (restock.get(a.produitId) || 0) + (a.quantite || 0))
    }
  }
  for (const [id, qte] of restock) {
    const { data: p } = await sb.from('produits').select('stock').eq('id', id).maybeSingle()
    if (p) await sb.from('produits').update({ stock: (p.stock || 0) + qte }).eq('id', id)
  }
  await sb.from('commandes').delete().neq('id', 0)
  console.log('Nettoye : commandes supprimees, stocks restaures')
  process.exit(0)
}

// La Petrisane (1) x2 + Pain Complet (8) x1 ; puis Petrisane x3 ; puis Pain Complet x2
const commandes = [
  { client: 'TEST Un', articles: [
    { produitId: 1, nom: 'La Pétrisane', quantite: 2, prix: 1.35 },
    { produitId: 8, nom: 'Pain Complet', quantite: 1, prix: 2.7 },
  ], total: 5.4 },
  { client: 'TEST Deux', articles: [
    { produitId: 1, nom: 'La Pétrisane', quantite: 3, prix: 1.35 },
  ], total: 4.05 },
  { client: 'TEST Trois', articles: [
    { produitId: 8, nom: 'Pain Complet', quantite: 2, prix: 2.7 },
  ], total: 5.4 },
]

for (const c of commandes) {
  const { data, error } = await sb.rpc('passer_commande', {
    p_client: c.client, p_email: '', p_telephone: '', p_stripe_session: null,
    p_creneau: '12:00', p_heure_retrait: new Date(Date.now() + 3600000).toISOString(),
    p_articles: c.articles, p_total: c.total,
  })
  const cmd = Array.isArray(data) ? data[0] : data
  console.log(error ? 'ERREUR ' + error.message : `Commande ${cmd.numero} creee (${c.client})`)
}
console.log('\nATTENDU dans "A sortir du four" : La Petrisane x5, Pain Complet x3 (8 pieces)')
