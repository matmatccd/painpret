import { ArrowLeft, QrCode, History } from 'lucide-react'
import { formatPrix } from '../lib/format'
import { useShop } from '../context/ShopContext'

// Libellés des statuts, côté client
const LIBELLES_STATUT = {
  'a-preparer': { label: 'En préparation', classe: 'bg-amber-50 text-amber-700 ring-amber-200' },
  prete: { label: 'Prête à retirer', classe: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  livree: { label: 'Récupérée', classe: 'bg-cream text-stone-warm ring-sand' },
}

// Historique des commandes du client (mémorisé sur l'appareil).
export default function Historique({ historique, onRetour, onVoirQR }) {
  const { commandes } = useShop()

  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-up px-4 py-6">
      <button
        type="button"
        onClick={onRetour}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-warm transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} /> Retour à la boutique
      </button>

      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">Mon compte</p>
      <h1 className="mt-1 text-3xl text-ink sm:text-4xl">Mes commandes</h1>

      {historique.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-sand bg-paper px-6 py-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream text-crust ring-1 ring-sand">
            <History size={26} />
          </span>
          <p className="mt-4 font-display text-lg text-ink">Aucune commande pour l'instant</p>
          <p className="mt-1 text-sm text-stone-warm">
            Vos commandes passées apparaîtront ici, avec leur statut.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {historique.map((entree) => {
            // Si la commande est encore "vivante" dans le magasin, on affiche
            // son statut en temps réel ; sinon on la considère récupérée.
            const live = commandes.find((c) => c.id === entree.id)
            const statut = live?.statut ?? 'livree'
            const infos = LIBELLES_STATUT[statut] ?? LIBELLES_STATUT.livree
            const date = new Date(entree.date)

            return (
              <div key={entree.id} className="rounded-xl border border-sand bg-paper p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <span className="font-display text-lg text-ink">#{entree.numero}</span>
                    <span className="text-xs text-stone-warm">
                      {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} ·{' '}
                      retrait {entree.creneau}
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    {live?.remboursee && (
                      <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200">
                        Remboursée
                      </span>
                    )}
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${infos.classe}`}>
                      {infos.label}
                    </span>
                  </span>
                </div>

                <p className="mt-2 text-sm text-stone-warm">
                  {entree.articles.map((a) => `${a.quantite}× ${a.nom}`).join(' · ')}
                </p>

                <div className="mt-3 flex items-center justify-between border-t border-sand pt-3">
                  <span className="price font-bold text-ink">{formatPrix(entree.total)}</span>
                  {live && statut !== 'livree' && (
                    <button
                      type="button"
                      onClick={() => onVoirQR(live)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-crust px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-crust-dark"
                    >
                      <QrCode size={14} /> Revoir mon QR Code
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
