// ============================================================
//  Notifications du CLIENT : "votre commande est prête !"
//  Le client s'abonne depuis sa page de confirmation ; quand le
//  boulanger passe la commande en "Prête", une fonction serveur
//  lui envoie une notification push — même appli fermée.
// ============================================================

import { supabase, modeReel } from './supabase'

const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC

function base64EnUint8(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const brut = atob(b64)
  return Uint8Array.from([...brut].map((c) => c.charCodeAt(0)))
}

// Ce navigateur sait-il recevoir des notifications push ?
export function pushClientDisponible() {
  return (
    modeReel &&
    Boolean(VAPID_PUBLIC) &&
    typeof Notification !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  )
}

// Abonne CET appareil pour être prévenu quand la commande <numero> est prête.
// Renvoie 'ok', 'refuse' (permission bloquée) ou 'indisponible'.
export async function activerNotifCommande(numero) {
  try {
    if (!pushClientDisponible()) return 'indisponible'
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return 'refuse'

    const reg = await navigator.serviceWorker.ready
    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64EnUint8(VAPID_PUBLIC),
      })
    }
    const donnees = sub.toJSON()
    const { error } = await supabase.from('push_clients').upsert(
      {
        numero,
        endpoint: donnees.endpoint,
        p256dh: donnees.keys?.p256dh,
        auth: donnees.keys?.auth,
      },
      { onConflict: 'numero,endpoint' },
    )
    return error ? 'indisponible' : 'ok'
  } catch {
    return 'indisponible'
  }
}
