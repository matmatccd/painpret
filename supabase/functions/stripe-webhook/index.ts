// ============================================================
//  PainPret - Stripe webhook.
//  Stripe calls this when a payment is CONFIRMED. We then create
//  the real order (even if the client closed the page) and update stock.
//
//  Deploy with "Verify JWT" DISABLED (Stripe does not send a JWT).
//  Secrets: STRIPE_SECRET, STRIPE_WEBHOOK_SECRET.
// ============================================================

import Stripe from 'npm:stripe@14'
import { createClient } from 'npm:@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET') ?? '', { apiVersion: '2024-06-20' })
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
)

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  let event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, WEBHOOK_SECRET)
  } catch (e: any) {
    return new Response('signature invalide: ' + e?.message, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const attenteId = session.metadata?.attente
    if (attenteId) {
      const { data: att } = await supabase
        .from('commandes_en_attente')
        .select('*')
        .eq('id', attenteId)
        .maybeSingle()
      if (att) {
        await supabase.rpc('passer_commande', {
          p_client: att.client,
          p_email: att.email,
          p_telephone: att.telephone,
          p_stripe_session: session.id,
          p_creneau: att.creneau,
          p_heure_retrait: att.heure_retrait,
          p_articles: att.articles,
          p_total: att.total,
        })
        await supabase.from('commandes_en_attente').delete().eq('id', attenteId)
      }
    }
  }

  return new Response('ok', { status: 200 })
})
