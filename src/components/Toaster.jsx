import { Bell, X } from 'lucide-react'
import { useNotifications } from '../context/NotificationsContext'

// Bulles éphémères en haut à droite (notifications client).
export default function Toaster() {
  const { toasts, retirerToast } = useNotifications()

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-xs flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-pop-in pointer-events-auto flex items-start gap-3 rounded-xl border border-sand bg-paper p-3.5 shadow-lg"
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream text-crust">
            <Bell size={15} />
          </span>
          <p className="flex-1 text-sm leading-snug text-ink">{t.message}</p>
          <button
            type="button"
            onClick={() => retirerToast(t.id)}
            aria-label="Fermer"
            className="text-stone-warm transition-colors hover:text-ink"
          >
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  )
}
