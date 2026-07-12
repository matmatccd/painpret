// ============================================================
//  Fonction serveur PainPrêt — crée une session de paiement Stripe.
//  Le site l'appelle, elle renvoie l'URL de la page de paiement Stripe.
//  Secret à définir (Supabase → Edge Functions → Secrets) :
//    STRIPE_SECRET  = sk_test_... (puis sk_live_... pour du vrai argent)
// ============================================================

import Stripe from 'npm:stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET') ?? '', {
  apiVersion: '2024-06-20',
})

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const { articles, email, base_url } = await req.json()
    const items = Array.isArray(articles) ? articles : []
    if (items.length === 0) {
      return Response.json({ erreur: 'panier vide' }, { status: 400, headers: cors })
    }

    const base = (base_url || '').replace(/#.*$/, '')
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email || undefined,
      line_items: items.map((a: any) => ({
        quantity: a.quantite,
        price_data: {
          currency: 'eur',
          product_data: { name: a.nom },
          unit_amount: Math.round(Number(a.prix) * 100),
        },
      })),
      success_url: `${base}#paiement-reussi`,
      cancel_url: `${base}#paiement-annule`,
    })

    return Response.json({ url: session.url }, { headers: cors })
  } catch (e: any) {
    return Response.json({ erreur: String(e?.message || e) }, { status: 400, headers: cors })
  }
})
