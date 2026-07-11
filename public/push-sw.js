/* eslint-disable no-undef */
// Gestionnaire de notifications push, greffé au service worker de PainPrêt.
// Affiche une notification (même appli fermée) quand la fonction serveur
// envoie un "push" à l'arrivée d'une commande.

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'Nouvelle commande', body: event.data ? event.data.text() : '' }
  }
  const titre = data.title || 'Nouvelle commande'
  const options = {
    body: data.body || '',
    icon: data.icon || 'pwa-192.png',
    badge: 'pwa-192.png',
    tag: data.tag || 'painpret-commande',
    renotify: true,
    vibrate: [120, 60, 120],
    data: { url: data.url || './#pro' },
  }
  event.waitUntil(self.registration.showNotification(titre, options))
})

// Au clic sur la notification : on ouvre / met au premier plan l'espace boulanger.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const cible = (event.notification.data && event.notification.data.url) || './#pro'
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((fenetres) => {
      for (const f of fenetres) {
        if ('focus' in f) return f.focus()
      }
      if (self.clients.openWindow) return self.clients.openWindow(cible)
    }),
  )
})
