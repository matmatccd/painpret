import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '../context/NotificationsContext'

// Cloche + petit panneau listant les notifications reçues.
// "clair" adapte le bouton aux fonds sombres (en-tête prune).
export default function NotificationBell({ clair = false }) {
  const { notifications, nonLues, marquerToutLu } = useNotifications()
  const [ouvert, setOuvert] = useState(false)

  function basculer() {
    const futur = !ouvert
    setOuvert(futur)
    if (futur) marquerToutLu() // ouvrir = tout marquer comme lu
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={basculer}
        aria-label="Notifications"
        className={`anim-cloche relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
          clair
            ? 'bg-white/10 text-white/85 ring-1 ring-white/20 hover:bg-white/15 hover:text-[#e9cd90] hover:ring-[#e9cd90]/60'
            : 'border border-sand bg-paper text-ink hover:border-crust/40'
        }`}
      >
        <Bell size={18} />
        {nonLues > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ember px-1 text-[11px] font-bold text-white">
            {nonLues}
          </span>
        )}
      </button>

      {ouvert && (
        <>
          {/* zone de clic pour fermer */}
          <div className="fixed inset-0 z-40" onClick={() => setOuvert(false)} />
          <div className="absolute right-0 z-50 mt-2 w-72 animate-pop-in overflow-hidden rounded-xl border border-sand bg-paper shadow-lg">
            <div className="border-b border-sand px-4 py-2.5">
              <p className="text-sm font-semibold text-ink">Notifications</p>
            </div>
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-stone-warm">
                Aucune notification pour l’instant.
              </p>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <li
                    key={n.id}
                    className="border-b border-sand/60 px-4 py-3 text-sm text-ink last:border-0"
                  >
                    {n.message}
                    <span className="mt-0.5 block text-xs text-stone-warm">
                      {n.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
