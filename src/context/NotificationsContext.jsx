import { createContext, useContext, useState, useCallback } from 'react'

// ============================================================
//  Notifications client
//  -----------------------------------------------------------
//  Deux choses :
//   - une liste persistante (le "centre de notifications", cloche)
//   - des bulles éphémères ("toasts") qui s'affichent 4 s puis disparaissent
// ============================================================

const NotificationsContext = createContext(null)

let compteur = 0
function nouvelId() {
  compteur += 1
  return `${Date.now()}-${compteur}`
}

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [toasts, setToasts] = useState([])

  const retirerToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  // Ajoute une notification (cloche) ET une bulle éphémère
  const ajouterNotification = useCallback(
    (message, ton = 'info') => {
      const id = nouvelId()
      setNotifications((n) => [{ id, message, ton, lu: false, date: new Date() }, ...n])
      setToasts((t) => [...t, { id, message, ton }])
      // Disparition automatique de la bulle après 4 s
      setTimeout(() => retirerToast(id), 4000)
    },
    [retirerToast],
  )

  const marquerToutLu = useCallback(() => {
    setNotifications((n) => n.map((x) => ({ ...x, lu: true })))
  }, [])

  const nonLues = notifications.filter((n) => !n.lu).length

  const valeur = {
    notifications,
    toasts,
    nonLues,
    ajouterNotification,
    marquerToutLu,
    retirerToast,
  }

  return (
    <NotificationsContext.Provider value={valeur}>{children}</NotificationsContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications doit être utilisé dans <NotificationsProvider>')
  return ctx
}
