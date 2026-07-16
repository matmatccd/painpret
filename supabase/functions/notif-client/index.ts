// ============================================================
//  PainPret - previent le CLIENT quand sa commande est PRETE.
//  Declenchee par un Database Webhook sur UPDATE de la table commandes.
//  Envoie une notification push aux appareils abonnes (push_clients).
//
//  Deployer avec "Verify JWT" DESACTIVE (appelee par le webhook).
//  Secrets utilises : VAPID_PUBLIC, VAPID_PRIVATE.
// ============================================================

import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}))
    const rec = body.record ?? {}
    const old = body.old_record ?? {}
    if (!rec.numero) return Response.json({ ok: false, erreur: 'pas de commande' })
    if (rec.statut === old.statut) return Response.json({ ok: true, ignore: 'statut inchange' })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Commande recuperee : on nettoie les abonnements, plus besoin
    if (rec.statut === 'livree') {
      await supabase.from('push_clients').delete().eq('numero', rec.numero)
      return Response.json({ ok: true, nettoye: true })
    }
    if (rec.statut !== 'prete') return Response.json({ ok: true, ignore: 'statut ' + rec.statut })

    webpush.setVapidDetails(
      'mailto:contact@lapetrie.fr',
      Deno.env.get('VAPID_PUBLIC') ?? '',
      Deno.env.get('VAPID_PRIVATE') ?? '',
    )

    const { data: subs } = await supabase.from('push_clients').select('*').eq('numero', rec.numero)
    const payload = JSON.stringify({
      title: 'Votre commande #' + rec.numero + ' est prete !',
      body: 'Vous pouvez passer la retirer. A tout de suite !',
      tag: 'painpret-client-' + rec.id,
      url: './',
    })

    let envoyees = 0
    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        )
        envoyees++
      } catch (e: any) {
        if (e?.statusCode === 404 || e?.statusCode === 410) {
          await supabase.from('push_clients').delete().eq('endpoint', s.endpoint)
        }
      }
    }
    return Response.json({ ok: true, envoyees })
  } catch (e: any) {
    return Response.json({ ok: false, erreur: String(e?.message || e) })
  }
})
