// ============================================================
//  Notifications du boulanger (quand l'espace pro est ouvert,
//  même dans un autre onglet ou en arrière-plan sur la tablette).
//  Sur mobile, on passe par le service worker (obligatoire).
// ============================================================

const ICONE = import.meta.env.BASE_URL + 'pwa-192.png'

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
