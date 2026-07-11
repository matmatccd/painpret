// ============================================================
//  Notifications du boulanger.
//  1) "En direct" : quand l'espace pro est ouvert (notifierCommande).
//  2) "Push" : même appli fermée — le boulanger s'abonne (activerPush),
//     et une fonction serveur envoie la notification à l'arrivée d'une
//     commande. Nécessite la clé VAPID + la table push_subscriptions.
// ============================================================

import { supabase, modeReel } from './supabase'

const ICONE = import.meta.env.BASE_URL + 'pwa-192.png'
const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC

// Convertit la clé VAPID (base64url) au format attendu par le navigateur
function base64EnUint8(base64) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const brut = atob(b64)
  return Uint8Array.from([...brut].map((c) => c.charCodeAt(0)))
}

// Abonne CET appareil aux notifications push et enregistre l'abonnement.
// À appeler après avoir obtenu la permission. Sans effet si non configuré.
export async function activerPush() {
  try {
    if (!modeReel || !VAPID_PUBLIC) return false
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
    const reg = await navigator.serviceWorker.ready
    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64EnUint8(VAPID_PUBLIC),
      })
    }
    const donnees = sub.toJSON()
    await supabase.from('push_subscriptions').upsert({
      endpoint: donnees.endpoint,
      p256dh: donnees.keys?.p256dh,
      auth: donnees.keys?.auth,
    })
    return true
  } catch {
    return false
  }
}

export function permissionNotif() {
  return typeof Notification !== 'undefined' ? Notification.permission : 'denied'
}

// Demande l'autorisation (à appeler sur un clic — exigé par iOS/Safari).
export async function demanderPermissionNotif() {
  if (typeof Notification === 'undefined') return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

// Affiche une notification système pour une nouvelle commande.
export async function notifierCommande(commande) {
  if (permissionNotif() !== 'granted') return

  const nbArticles = commande.articles.reduce((n, a) => n + a.quantite, 0)
  const titre = `Nouvelle commande #${commande.numero}`
  const corps = `${commande.client ? commande.client + ' — ' : ''}${nbArticles} article${
    nbArticles > 1 ? 's' : ''
  } · retrait ${commande.creneau}`
  const options = {
    body: corps,
    icon: ICONE,
    badge: ICONE,
    tag: 'painpret-cmd-' + commande.id, // évite les doublons
    renotify: true,
    vibrate: [120, 60, 120],
  }

  // Sur mobile, seul le service worker peut afficher une notification.
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const reg = await navigator.serviceWorker.getRegistration()
      if (reg) {
        await reg.showNotification(titre, options)
        return
      }
    }
  } catch {
    /* on tente le repli ci-dessous */
  }
  // Repli (ordinateur) : notification directe
  try {
    new Notification(titre, options)
  } catch {
    /* silencieux */
  }
}
