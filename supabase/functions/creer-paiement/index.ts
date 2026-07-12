// ============================================================
//  Fonction serveur PainPrêt — crée une session de paiement Stripe.
//  Enregistre la commande "en attente", puis renvoie l'URL de paiement.
//  La vraie commande sera créée par le webhook une fois le paiement validé.
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

    // 1) On garde la commande "en attente" (le webhook la validera après paiement)
    const { data: attente, error } = await supabase
      .from('commandes_en_attente')
      .insert({
        client: c.client ?? '',
        email: c.email ?? '',
        telephone: c.telephone ?? '',
        creneau: c.creneau,
        heure_retrait: c.heureRetrait ?? null,
        articles: items,
        total: c.total,
      })
      .select()
      .single()
    if (error) return Response.json({ erreur: error.message }, { status: 400, headers: cors })

    // 2) Page de paiement Stripe (le n° d'attente voyage dans les métadonnées)
    const base = (c.base_url || '').replace(/#.*$/, '')
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: c.email || undefined,
      metadata: { attente: String(attente.id) },
      line_items: items.map((a: any) => ({
        quantity: a.quantite,
        price_data: {
          currency: 'eur',
          product_data: { name: a.nom },
          unit_amount: Math.round(Number(a.prix) * 100),
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
