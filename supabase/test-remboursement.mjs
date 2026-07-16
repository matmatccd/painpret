// TEST bout-en-bout : crée une commande de test rattachée au VRAI paiement
// Stripe (1,35 EUR déjà payé), la rembourse via la fonction 'rembourser',
// passe le statut en 'prete' puis 'livree' (déclenche le webhook notif-client),
// puis nettoie tout (commande supprimée, stock restauré).
// Lancer : PP_EMAIL=... PP_MDP=... PP_SESSION=cs_test_... node supabase/test-remboursement.mjs
import { createClient } from '@supabase/supabase-js'

const sb = createClient('https://utxqtsasdygyrddyhogu.supabase.co', 'sb_publishable_YuZN7MNNlsBpiKugzW07GA_fNXKoMa4')
const { error: e1 } = await sb.auth.signInWithPassword({ email: process.env.PP_EMAIL, password: process.env.PP_MDP })
if (e1) { console.error('Connexion:', e1.message); process.exit(1) }
console.log('1. Connecté en boulanger ✓')

// 2. Créer la commande de test (via la RPC — décrémente le stock du produit 1)
const { data: cmd, error: e2 } = await sb.rpc('passer_commande', {
  p_client: 'TEST Remboursement',
  p_email: '',
  p_telephone: '',
  p_stripe_session: process.env.PP_SESSION,
  p_creneau: '12:00',
  p_heure_retrait: new Date().toISOString(),
  p_articles: [{ produitId: 1, nom: 'La Pétrisane', quantite: 1, prix: 1.35 }],
  p_total: 1.35,
})
if (e2) { console.error('Création:', e2.message); process.exit(1) }
const commande = Array.isArray(cmd) ? cmd[0] : cmd
console.log(`2. Commande test créée : #${commande.numero} (id ${commande.id}) ✓`)

// 3. Rembourser via la fonction serveur (avec le jeton du boulanger connecté)
const { data: remb, error: e3 } = await sb.functions.invoke('rembourser', { body: { id: commande.id } })
if (e3 || remb?.erreur) { console.error('Remboursement:', e3?.message || remb.erreur); process.exit(1) }
console.log('3. Remboursement Stripe :', JSON.stringify(remb), '✓')

// 4. Vérifier le drapeau remboursee en base
const { data: verif } = await sb.from('commandes').select('remboursee').eq('id', commande.id).maybeSingle()
console.log('4. Drapeau remboursee en base :', verif?.remboursee, verif?.remboursee ? '✓' : '✗')

// 5. Déclencher le webhook notif-client (statut -> prete puis livree)
await sb.from('commandes').update({ statut: 'prete' }).eq('id', commande.id)
console.log('5. Statut -> prete (webhook notif-client déclenché) ✓')
await new Promise((r) => setTimeout(r, 2500))
await sb.from('commandes').update({ statut: 'livree' }).eq('id', commande.id)
console.log('6. Statut -> livree (nettoyage abonnements) ✓')

// 7. Nettoyage : supprimer la commande + restaurer le stock
await sb.from('commandes').delete().eq('id', commande.id)
const { data: p } = await sb.from('produits').select('stock').eq('id', 1).maybeSingle()
await sb.from('produits').update({ stock: (p?.stock ?? 0) + 1 }).eq('id', 1)
console.log(`7. Nettoyé : commande supprimée, stock Pétrisane restauré (${(p?.stock ?? 0) + 1}) ✓`)
console.log('TERMINÉ.')
