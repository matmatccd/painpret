// ============================================================
//  PainPret - rembourser une commande payee.
//  Appelee par l'espace boulanger (bouton "Rembourser le client").
//  Retrouve le paiement Stripe de la commande et cree le remboursement.
//
//  Deployer avec "Verify JWT" ACTIVE (seul le boulanger connecte
//  peut appeler cette fonction). Secret utilise : STRIPE_SECRET.
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
    const { id } = await req.json()
    if (!id) return Response.json({ erreur: 'id manquant' }, { status: 400, headers: cors })

    const { data: cmd } = await supabase.from('commandes').select('*').eq('id', id).maybeSingle()
    if (!cmd) return Response.json({ erreur: 'commande introuvable' }, { status: 404, headers: cors })
    if (cmd.remboursee) return Response.json({ ok: true, deja: true }, { headers: cors })
    if (!cmd.stripe_session) {
      return Response.json({ erreur: 'pas de paiement en ligne sur cette commande' }, { status: 400, headers: cors })
    }

    const session = await stripe.checkout.sessions.retrieve(cmd.stripe_session)
    const paymentIntent = session.payment_intent
    if (!paymentIntent) {
      return Response.json({ erreur: 'paiement introuvable chez Stripe' }, { status: 400, headers: cors })
    }

    await stripe.refunds.create({ payment_intent: String(paymentIntent) })
    await supabase.from('commandes').update({ remboursee: true }).eq('id', id)

    return Response.json({ ok: true }, { headers: cors })
  } catch (e) {
    return Response.json({ erreur: String(e?.message || e) }, { status: 400, headers: cors })
  }
})
