// ============================================================
//  Fonction serveur PainPrêt — crée une session de paiement Stripe.
//  Enregistre la commande "en attente", puis renvoie l'URL de paiement.
//  La vraie commande sera créée par le webhook une fois le paiement validé.
//
//  Nom déployé : "payement" (c'est ce nom que le site appelle).
//  Secret : STRIPE_SECRET = sk_test_... (puis sk_live_...).
// ============================================================

import Stripe from 'npm:stripe@14'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET') ?? '', { apiVersion: '2024-06-20' })
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const c = await req.json()
    const items = Array.isArray(c.articles) ? c.articles : []
    if (items.length === 0) {
      return Response.json({ erreur: 'panier vide' }, { status: 400, headers: cors })
    }

    // --- Sécurité : on NE fait PAS confiance aux prix envoyés par le navigateur.
    // On relit le VRAI prix de chaque produit dans la base (sinon un client
    // malin pourrait payer une baguette 0,01 €). ------------------------------
    const ids = [...new Set(items.map((a: any) => Number(a.produitId)).filter(Boolean))]
    const { data: produits, error: eProd } = await supabase
      .from('produits')
      .select('id, nom, prix')
      .in('id', ids)
    if (eProd) return Response.json({ erreur: eProd.message }, { status: 400, headers: cors })
    const parId = new Map((produits ?? []).map((p: any) => [Number(p.id), p]))

    const articlesSurs: any[] = []
    for (const a of items) {
      const p = parId.get(Number(a.produitId))
      if (!p) return Response.json({ erreur: 'produit introuvable' }, { status: 400, headers: cors })
      const q = Math.max(1, Math.floor(Number(a.quantite) || 0))
      articlesSurs.push({
        produitId: p.id,
        nom: a.nom || p.nom, // libellé (garde l'éventuelle variante pour le boulanger)
        quantite: q,
        prix: Number(p.prix), // PRIX OFFICIEL, lu en base
        remarque: a.remarque || '',
      })
    }
    const totalSur = articlesSurs.reduce((s, a) => s + a.prix * a.quantite, 0)

    // 1) On garde la commande "en attente" (le webhook la validera après paiement)
    const { data: attente, error } = await supabase
      .from('commandes_en_attente')
      .insert({
        client: c.client ?? '',
        email: c.email ?? '',
        telephone: c.telephone ?? '',
        creneau: c.creneau,
        heure_retrait: c.heureRetrait ?? null,
        articles: articlesSurs,
        total: totalSur,
      })
      .select()
      .single()
    if (error) return Response.json({ erreur: error.message }, { status: 400, headers: cors })

    // 2) Page de paiement Stripe (avec les prix officiels)
    const base = (c.base_url || '').replace(/#.*$/, '')
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: c.email || undefined,
      metadata: { attente: String(attente.id) },
      line_items: articlesSurs.map((a: any) => ({
        quantity: a.quantite,
        price_data: {
          currency: 'eur',
          product_data: { name: a.nom },
          unit_amount: Math.round(a.prix * 100),
        },
      })),
      success_url: `${base}#paiement-reussi?sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}#paiement-annule`,
    })

    return Response.json({ url: session.url }, { headers: cors })
  } catch (e: any) {
    return Response.json({ erreur: String(e?.message || e) }, { status: 400, headers: cors })
  }
})
