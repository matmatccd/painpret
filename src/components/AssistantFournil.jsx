import { Sparkles, TrendingUp, Clock, AlertTriangle, GraduationCap } from 'lucide-react'

// ============================================================
//  L'assistant du fournil
//  -----------------------------------------------------------
//  Analyse les VRAIES ventes de la boutique pour conseiller le
//  boulanger chaque matin, en français simple :
//   1. combien produire aujourd'hui (moyenne des mêmes jours passés)
//   2. l'heure de pointe des retraits
//   3. les stocks trop bas par rapport à la demande habituelle
//  Tout est calculé sur place, à partir des commandes existantes.
// ============================================================

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

export function analyser(commandes, produits) {
  const conseils = []
  const maintenant = new Date()
  const jourSem = maintenant.getDay()

  // Les commandes datées (l'historique exploitable)
  const historique = commandes.filter((c) => c.date)

  // --- 1) Production conseillée : ce qui se vend les mêmes jours de semaine ---
  const parProduit = {} // nom -> { total, jours: Set des dates }
  historique.forEach((c) => {
    const d = new Date(c.date)
    if (d.getDay() !== jourSem) return
    const cle = d.toDateString()
    c.articles.forEach((a) => {
      if (!parProduit[a.nom]) parProduit[a.nom] = { total: 0, jours: new Set() }
      parProduit[a.nom].total += a.quantite
      parProduit[a.nom].jours.add(cle)
    })
  })
  const previsions = Object.entries(parProduit)
    .map(([nom, v]) => ({ nom, moyenne: Math.ceil(v.total / v.jours.size) }))
    .sort((a, b) => b.moyenne - a.moyenne)

  if (previsions.length > 0) {
    const top = previsions.slice(0, 3)
    conseils.push({
      icone: TrendingUp,
      titre: `Production conseillée pour ce ${JOURS[jourSem]}`,
      texte: top
        .map((p) => `~${p.moyenne} ${p.nom}`)
        .join(' · '),
      note: 'Moyenne de ce que vos clients commandent le même jour de semaine.',
    })
  }

  // --- 2) Heure de pointe des retraits ---
  const parHeure = {}
  historique.forEach((c) => {
    if (!c.heureRetrait) return
    const h = new Date(c.heureRetrait).getHours()
    if (!Number.isNaN(h)) parHeure[h] = (parHeure[h] || 0) + 1
  })
  const heures = Object.entries(parHeure).sort((a, b) => b[1] - a[1])
  if (heures.length > 0 && historique.length >= 5) {
    const [heurePointe] = heures[0]
    conseils.push({
      icone: Clock,
      titre: `Le plus gros de la journée arrive vers ${heurePointe}h`,
      texte: `Prévoyez d'avoir les commandes prêtes un peu avant ${heurePointe}h.`,
    })
  }

  // --- 3) Stocks trop bas par rapport à la demande habituelle du jour ---
  const aRecharger = previsions
    .map((prev) => {
      const produit = produits.find((p) => p.nom === prev.nom)
      return produit && produit.stock < prev.moyenne
        ? { id: produit.id, nom: prev.nom, stock: produit.stock, attendu: prev.moyenne }
        : null
    })
    .filter(Boolean)
    .slice(0, 3)

  if (aRecharger.length > 0) {
    conseils.push({
      icone: AlertTriangle,
      alerte: true,
      titre: 'Stock à prévoir pour la journée',
      texte: `D'après les habitudes de vos clients un ${JOURS[jourSem]} :`,
      stocks: aRecharger,
    })
  }

  return { conseils, nbVentes: historique.length }
}

export default function AssistantFournil({ commandes, produits, ajusterStock }) {
  const { conseils, nbVentes } = analyser(commandes, produits)

  return (
    <section className="overflow-hidden rounded-2xl border border-crust/25 bg-gradient-to-br from-paper to-cream">
      {/* En-tête de l'assistant */}
      <div className="flex items-center gap-3 border-b border-sand/70 px-4 py-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-crust text-[#e9cd90] shadow-sm">
          <Sparkles size={19} />
        </span>
        <div>
          <p className="font-display text-lg leading-tight text-ink">L'assistant du fournil</p>
          <p className="text-xs text-stone-warm">
            Il analyse vos ventes réelles et vous conseille chaque matin.
          </p>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {conseils.length === 0 ? (
          // Pas encore assez de ventes : l'assistant "apprend"
          <div className="flex items-start gap-3 rounded-xl bg-white/70 p-3.5 ring-1 ring-sand">
            <GraduationCap size={18} className="mt-0.5 shrink-0 text-crust" />
            <p className="text-sm leading-relaxed text-stone-warm">
              <span className="font-semibold text-ink">L'assistant apprend vos habitudes.</span>{' '}
              Encore quelques jours de commandes ({nbVentes} vente{nbVentes > 1 ? 's' : ''} pour
              l'instant) et il pourra vous conseiller la production du matin, l'heure de pointe et
              les stocks à prévoir.
            </p>
          </div>
        ) : (
          conseils.map((c) => {
            const Icone = c.icone
            return (
              <div
                key={c.titre}
                className={`flex items-start gap-3 rounded-xl p-3.5 ring-1 ${
                  c.alerte ? 'bg-amber-50 ring-amber-200' : 'bg-white/70 ring-sand'
                }`}
              >
                <Icone
                  size={18}
                  className={`mt-0.5 shrink-0 ${c.alerte ? 'text-amber-600' : 'text-crust'}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{c.titre}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-stone-warm">{c.texte}</p>
                  {c.note && <p className="mt-1 text-xs text-stone-warm/80">{c.note}</p>}
                  {/* Stocks conseillés : un bouton pour les appliquer d'un geste */}
                  {c.stocks && (
                    <ul className="mt-2 space-y-1.5">
                      {c.stocks.map((s) => (
                        <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                          <span className="text-ink">
                            {s.nom} — <span className="text-stone-warm">reste {s.stock}, il en part ~{s.attendu}</span>
                          </span>
                          {ajusterStock && (
                            <button
                              type="button"
                              onClick={() => ajusterStock(s.id, s.attendu - s.stock)}
                              className="rounded-lg bg-crust px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-crust-dark"
                            >
                              Prévoir ~{s.attendu}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
