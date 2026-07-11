// ============================================================
//  Fonction serveur PainPrêt — déclenchée à CHAQUE nouvelle commande
//  (via un "Database Webhook" sur INSERT dans la table commandes).
//  1) Envoie une notification push au boulanger (même appli fermée).
//  2) Envoie un email de confirmation au client (si email + domaine).
//
//  Secrets à définir (Supabase → Edge Functions → Secrets) :
//    VAPID_PUBLIC, VAPID_PRIVATE   (générés)
//    RESEND_API_KEY                (ta clé Resend)
//    EMAIL_FROM                    (optionnel : "PainPrêt <commande@ton-domaine.fr>")
//  (SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont fournis automatiquement.)
// ============================================================

import webpush from 'npm:web-push@3.6.7'
import { createClient } from 'npm:@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const VAPID_PUBLIC = Deno.env.get('VAPID_PUBLIC')!
const VAPID_PRIVATE = Deno.env.get('VAPID_PRIVATE')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const EMAIL_FROM = Deno.env.get('EMAIL_FROM')

webpush.setVapidDetails('mailto:contact@lapetrie.fr', VAPID_PUBLIC, VAPID_PRIVATE)

Deno.serve(async (req) => {
  try {
    const body = await req.json()
    const commande = body.record ?? body
    if (!commande || !commande.numero) return new Response('no order', { status: 200 })

    const articles = Array.isArray(commande.articles) ? commande.articles : []
    const nbArticles = articles.reduce((n: number, a: any) => n + (a.quantite || 0), 0)

    // 1) Notifications push au boulanger --------------------------------------
    const { data: subs } = await supabase.from('push_subscriptions').select('*')
    const payload = JSON.stringify({
      title: `Nouvelle commande #${commande.numero}`,
      body: `${commande.client ? commande.client + ' — ' : ''}${nbArticles} article(s) · retrait ${commande.creneau}`,
      tag: 'painpret-cmd-' + commande.id,
      url: './#pro',
    })
    for (const s of subs ?? []) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload,
        )
      } catch (e: any) {
        if (e?.statusCode === 404 || e?.statusCode === 410) {
          await supabase.from('push_subscriptions').delete().eq('endpoint', s.endpoint)
        }
      }
    }

    // 2) Email de confirmation au client (si email fourni + domaine configuré) -
    if (commande.email && RESEND_API_KEY && EMAIL_FROM) {
      const lignes = articles.map((a: any) => `${a.quantite}× ${a.nom}`).join('<br>')
      const total = Number(commande.total).toFixed(2).replace('.', ',')
      const qr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
        'PAINPRET|' + commande.numero + '|' + commande.creneau,
      )}`
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: [commande.email],
          subject: `Votre commande #${commande.numero} — La Pétrie`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;color:#33222a">
              <h2 style="color:#6f2f43">Merci ${commande.client || ''} !</h2>
              <p>Votre commande <strong>#${commande.numero}</strong> est bien enregistrée.</p>
              <p style="background:#faf3f1;border-radius:10px;padding:12px">${lignes}<br>
              <strong>Total : ${total} €</strong> — à régler au retrait.</p>
              <p>Retrait : <strong>${commande.creneau}</strong><br>
              164 Avenue Jean Jaurès, 51100 Reims</p>
              <p>Présentez ce QR Code (ou le numéro #${commande.numero}) en boutique :</p>
              <img src="${qr}" alt="QR Code de retrait" width="180" height="180" />
              <p style="color:#6d5560;font-size:13px">À bientôt chez La Pétrie ! 🥖</p>
            </div>`,
        }),
      })
    }

    return new Response('ok', { status: 200 })
  } catch (e: any) {
    return new Response('error: ' + (e?.message || e), { status: 200 })
  }
})
