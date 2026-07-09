import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Clock,
  Euro,
  Package,
  ClipboardList,
  CalendarClock,
  QrCode,
  ScanLine,
  Camera,
  ChefHat,
  PackageCheck,
  Printer,
  LayoutDashboard,
  LogOut,
  Wheat,
  FolderTree,
  Minus,
  Plus,
  PlusCircle,
  Trash2,
  Pencil,
  Image as ImageIcon,
  X,
  CheckCircle2,
  XCircle,
  RotateCcw,
  MessageSquare,
} from 'lucide-react'
import { Scanner } from '@yudiel/react-qr-scanner'
import { useShop } from '../context/ShopContext'
import { bakery } from '../data/bakery'
import { formatPrix } from '../lib/format'
import { jouerCarillon } from '../lib/son'

// Imprime un ticket de commande simple (ouvre la fenêtre d'impression).
function imprimerTicket(commande) {
  const lignes = commande.articles
    .map(
      (a) =>
        `<tr><td>${a.quantite} ×</td><td>${a.nom}${
          a.remarque ? `<br><em>→ ${a.remarque}</em>` : ''
        }</td></tr>`,
    )
    .join('')
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Ticket #${commande.numero}</title>
    <style>
      body { font-family: -apple-system, sans-serif; width: 260px; margin: 0 auto; padding: 12px; color: #000; }
      h1 { font-size: 16px; text-align: center; margin: 0; }
      p { text-align: center; margin: 4px 0; font-size: 12px; }
      hr { border: none; border-top: 1px dashed #000; margin: 10px 0; }
      table { width: 100%; font-size: 13px; border-collapse: collapse; }
      td { padding: 3px 4px 3px 0; vertical-align: top; }
      .total { font-weight: bold; font-size: 15px; display: flex; justify-content: space-between; }
      .numero { font-size: 22px; font-weight: bold; text-align: center; margin: 8px 0; }
    </style></head><body>
    <h1>La Pétrie — PainPrêt</h1>
    <p>${bakery.adresse}, ${bakery.ville}</p>
    <div class="numero">#${commande.numero}</div>
    <p>Retrait : <strong>${commande.creneau}</strong></p>
    <hr><table>${lignes}</table><hr>
    <div class="total"><span>TOTAL</span><span>${commande.total.toFixed(2).replace('.', ',')} €</span></div>
    <hr><p>Payé en ligne — merci !</p>
    </body></html>`

  const fenetre = window.open('', '_blank', 'width=320,height=480')
  if (!fenetre) return // pop-up bloquée : on abandonne sans casser la page
  fenetre.document.write(html)
  fenetre.document.close()
  fenetre.focus()
  fenetre.print()
}

// Les 3 étapes d'une commande — le boulanger tape sur celle qu'il veut.
const ETAPES_STATUT = [
  { id: 'a-preparer', label: 'À préparer', icone: ChefHat, actif: 'bg-amber-500 text-white' },
  { id: 'prete', label: 'Prête', icone: CheckCircle2, actif: 'bg-emerald-600 text-white' },
  { id: 'livree', label: 'Livrée', icone: PackageCheck, actif: 'bg-crust text-white' },
]

export default function MerchantDashboard({ onRetourClient, onDeconnexion }) {
  const {
    produits,
    commandes,
    ajusterStock,
    marquerEpuise,
    remettreEnStock,
    changerStatut,
    validerRetrait,
    ajouterProduit,
    mettreAJourProduit,
    supprimerProduit,
    categories,
    ajouterCategorie,
    supprimerCategorie,
    ajouterSousCategorie,
    supprimerSousCategorie,
  } = useShop()

  // L'onglet "Aujourd'hui" est l'écran d'accueil du boulanger : l'essentiel en un coup d'œil.
  const [onglet, setOnglet] = useState('jour')

  // 🔔 Carillon quand une NOUVELLE commande arrive pendant que l'espace est ouvert.
  // On mémorise les commandes déjà connues pour ne sonner que sur les nouvelles.
  const idsConnus = useRef(null)
  useEffect(() => {
    const ids = commandes.map((c) => c.id)
    if (idsConnus.current === null) {
      // premier affichage : on ne sonne pas pour les commandes existantes
      idsConnus.current = new Set(ids)
      return
    }
    const nouvelles = ids.filter((id) => !idsConnus.current.has(id))
    if (nouvelles.length > 0) jouerCarillon()
    idsConnus.current = new Set(ids)
  }, [commandes])

  // Créneaux présents dans les commandes, triés par heure
  const creneaux = [...new Set(commandes.map((c) => c.creneau))].sort()

  const commandesActives = commandes.filter((c) => c.statut !== 'livree').length
  const produitsEpuises = produits.filter((p) => !p.disponible).length

  return (
    <div className="min-h-dvh bg-cream">
      {/* En-tête de l'espace boulanger */}
      <header className="sticky top-0 z-40 border-b border-crust-dark/40 bg-ink text-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <Wheat size={18} />
            </span>
            <div>
              <p className="font-display text-base leading-tight">Espace boulanger</p>
              <p className="text-xs text-white/55">{bakery.nom}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onRetourClient}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20"
            >
              <ArrowLeft size={16} /> Site client
            </button>
            <button
              type="button"
              onClick={onDeconnexion}
              aria-label="Se déconnecter"
              title="Se déconnecter"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl px-4 py-6">
        {/* Indicateurs */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <Indicateur valeur={commandesActives} label="Commandes en cours" />
          <Indicateur valeur={`~${bakery.tempsPreparation} min`} label="Temps de prépa" />
          <Indicateur valeur={produitsEpuises} label="Produits épuisés" />
        </div>

        {/* Onglets — défilent horizontalement sur mobile plutôt que de s'empiler */}
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-sand bg-paper p-1 no-scrollbar">
          <BoutonOnglet actif={onglet === 'jour'} onClick={() => setOnglet('jour')} icone={<LayoutDashboard size={16} />}>
            Aujourd'hui
          </BoutonOnglet>
          <BoutonOnglet actif={onglet === 'commandes'} onClick={() => setOnglet('commandes')} icone={<ClipboardList size={16} />}>
            Commandes
          </BoutonOnglet>
          <BoutonOnglet actif={onglet === 'planning'} onClick={() => setOnglet('planning')} icone={<CalendarClock size={16} />}>
            Emploi du temps
          </BoutonOnglet>
          <BoutonOnglet actif={onglet === 'retrait'} onClick={() => setOnglet('retrait')} icone={<QrCode size={16} />}>
            Scanner un retrait
          </BoutonOnglet>
          <BoutonOnglet actif={onglet === 'produits'} onClick={() => setOnglet('produits')} icone={<Package size={16} />}>
            Mes produits
          </BoutonOnglet>
          <BoutonOnglet actif={onglet === 'categories'} onClick={() => setOnglet('categories')} icone={<FolderTree size={16} />}>
            Catégories
          </BoutonOnglet>
        </div>

        {/* Contenu de l'onglet actif (transition en fondu au changement) */}
        <div key={onglet} className="animate-fade-up">
        {/* ---------- AUJOURD'HUI (accueil du boulanger) ---------- */}
        {onglet === 'jour' && (
          <VueDuJour
            commandes={commandes}
            produits={produits}
            changerStatut={changerStatut}
            ajusterStock={ajusterStock}
            remettreEnStock={remettreEnStock}
            allerVoir={setOnglet}
          />
        )}

        {/* ---------- COMMANDES ---------- */}
        {onglet === 'commandes' && (
          creneaux.length === 0 ? (
            <EtatVide emoji="📋" titre="Aucune commande" texte="Les nouvelles commandes des clients apparaîtront ici." />
          ) : (
          <div className="space-y-6">
            {creneaux.map((creneau) => {
              const cmdsDuCreneau = commandes.filter((c) => c.creneau === creneau)
              return (
                <section key={creneau}>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1 text-sm font-semibold text-white">
                      <Clock size={14} /> {creneau}
                    </span>
                    <span className="text-sm text-stone-warm">
                      {cmdsDuCreneau.length} commande{cmdsDuCreneau.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {cmdsDuCreneau.map((cmd) => (
                      <CarteCommande key={cmd.id} commande={cmd} onStatut={(st) => changerStatut(cmd.id, st)} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
          )
        )}

        {/* ---------- EMPLOI DU TEMPS ---------- */}
        {onglet === 'planning' && <Planning commandes={commandes} creneaux={creneaux} />}

        {/* ---------- RETRAIT (scan QR) ---------- */}
        {onglet === 'retrait' && <Retrait validerRetrait={validerRetrait} />}

        {/* ---------- PRODUITS ---------- */}
        {onglet === 'produits' && (
          <GestionProduits
            produits={produits}
            ajusterStock={ajusterStock}
            marquerEpuise={marquerEpuise}
            remettreEnStock={remettreEnStock}
            ajouterProduit={ajouterProduit}
            mettreAJourProduit={mettreAJourProduit}
            supprimerProduit={supprimerProduit}
          />
        )}

        {/* ---------- CATÉGORIES ---------- */}
        {onglet === 'categories' && (
          <GestionCategories
            categories={categories}
            produits={produits}
            ajouterCategorie={ajouterCategorie}
            supprimerCategorie={supprimerCategorie}
            ajouterSousCategorie={ajouterSousCategorie}
            supprimerSousCategorie={supprimerSousCategorie}
            ajouterProduit={ajouterProduit}
          />
        )}
        </div>
      </div>
    </div>
  )
}

// --- Petit état vide réutilisable ---
function EtatVide({ emoji, titre, texte }) {
  return (
    <div className="rounded-xl border border-dashed border-sand bg-paper px-6 py-12 text-center">
      <span className="text-4xl">{emoji}</span>
      <p className="mt-3 font-display text-lg text-ink">{titre}</p>
      <p className="mt-1 text-sm text-stone-warm">{texte}</p>
    </div>
  )
}

// --- Indicateur ---
function Indicateur({ valeur, label }) {
  return (
    <div className="rounded-xl border border-sand bg-paper p-4">
      <p className="font-display text-2xl text-ink">{valeur}</p>
      <p className="mt-0.5 text-xs text-stone-warm">{label}</p>
    </div>
  )
}

// --- Onglet ---
function BoutonOnglet({ actif, onClick, icone, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
        actif ? 'bg-ink text-white' : 'text-stone-warm hover:text-ink'
      }`}
    >
      {icone}
      {children}
    </button>
  )
}

// --- "Aujourd'hui" : l'essentiel de la journée en un coup d'œil ---
function VueDuJour({ commandes, produits, changerStatut, ajusterStock, remettreEnStock, allerVoir }) {
  const actives = commandes.filter((c) => c.statut !== 'livree')
  // Chiffre d'affaires du jour : toutes les commandes sont payées en ligne
  const caJour = commandes.reduce((somme, c) => somme + c.total, 0)
  const nbLivrees = commandes.filter((c) => c.statut === 'livree').length
  // Clients qui ont signalé leur arrivée : à servir en priorité
  const surPlace = actives.filter((c) => c.arrive)
  // Prochain créneau à préparer
  const prochainCreneau = [...new Set(actives.map((c) => c.creneau))].sort()[0]
  const aPreparer = actives.filter((c) => c.creneau === prochainCreneau)
  // Stock bas ou épuisé : à surveiller
  const stockBas = produits.filter((p) => p.stock <= 3)

  return (
    <div className="space-y-8">
      {/* 0. Chiffre d'affaires du jour */}
      <section className="flex items-center justify-between gap-3 rounded-xl border border-sand bg-paper p-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium text-stone-warm">
            <Euro size={13} /> Chiffre d'affaires du jour
          </p>
          <p className="price mt-0.5 font-display text-3xl text-ink">{formatPrix(caJour)}</p>
        </div>
        <div className="text-right text-sm text-stone-warm">
          <p>
            <span className="font-semibold text-ink">{commandes.length}</span> commande
            {commandes.length > 1 ? 's' : ''}
          </p>
          <p>
            <span className="font-semibold text-emerald-700">{nbLivrees}</span> livrée
            {nbLivrees > 1 ? 's' : ''}
          </p>
        </div>
      </section>

      {/* 1. Clients sur place : priorité absolue */}
      {surPlace.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
            <h2 className="text-lg text-ink">
              {surPlace.length} client{surPlace.length > 1 ? 's' : ''} sur place
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {surPlace.map((cmd) => (
              <CarteCommande key={cmd.id} commande={cmd} onStatut={(st) => changerStatut(cmd.id, st)} />
            ))}
          </div>
        </section>
      )}

      {/* 2. À préparer maintenant (prochain créneau) */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg text-ink">
            <Clock size={18} className="text-crust" />
            À préparer {prochainCreneau ? `— créneau ${prochainCreneau}` : ''}
          </h2>
          <button
            type="button"
            onClick={() => allerVoir('commandes')}
            className="text-sm font-medium text-crust hover:underline"
          >
            Toutes les commandes →
          </button>
        </div>
        {aPreparer.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {aPreparer.map((cmd) => (
              <CarteCommande key={cmd.id} commande={cmd} onStatut={(st) => changerStatut(cmd.id, st)} />
            ))}
          </div>
        ) : (
          <EtatVide emoji="✅" titre="Rien à préparer" texte="Les nouvelles commandes en ligne apparaîtront ici." />
        )}
      </section>

      {/* 3. Stock à surveiller */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg text-ink">
            <Package size={18} className="text-crust" /> Stock à surveiller
          </h2>
          <button
            type="button"
            onClick={() => allerVoir('produits')}
            className="text-sm font-medium text-crust hover:underline"
          >
            Gérer les produits →
          </button>
        </div>
        {stockBas.length > 0 ? (
          <div className="space-y-2">
            {stockBas.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-sand bg-paper p-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white text-xl"
                  style={p.image ? undefined : { background: `linear-gradient(150deg, ${p.from}, ${p.to})` }}
                >
                  {p.image ? <img src={p.image} alt="" className="h-full w-full object-contain" /> : p.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{p.nom}</p>
                  {p.stock === 0 ? (
                    <span className="text-xs font-semibold text-rose-600">Épuisé</span>
                  ) : (
                    <span className="text-xs font-semibold text-ember">Plus que {p.stock} en stock</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => (p.stock === 0 ? remettreEnStock(p.id) : ajusterStock(p.id, 10))}
                  className="shrink-0 rounded-lg bg-crust px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-crust-dark"
                >
                  {p.stock === 0 ? 'Remettre en stock' : '+10'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-sand bg-paper px-4 py-5 text-center text-sm text-stone-warm">
            Tout va bien : aucun produit en rupture ni en stock bas.
          </p>
        )}
      </section>
    </div>
  )
}

// --- Carte commande ---
// Le statut se choisit avec 3 gros boutons : À préparer / Prête / Livrée.
// On tape sur celui qu'on veut — et on peut revenir en arrière si on s'est trompé.
function CarteCommande({ commande, onStatut }) {
  const livree = commande.statut === 'livree'

  return (
    <div className={`flex flex-col rounded-xl border border-sand bg-paper p-4 ${livree ? 'opacity-75' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="font-display text-lg text-ink">#{commande.numero}</span>
          {commande.nouvelle && commande.statut === 'a-preparer' && (
            <span className="rounded-full bg-ember px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Nouvelle
            </span>
          )}
        </span>
        <span className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-medium text-stone-warm">
            <Clock size={13} /> Retrait {commande.creneau}
          </span>
          <button
            type="button"
            onClick={() => imprimerTicket(commande)}
            aria-label={`Imprimer le ticket de la commande ${commande.numero}`}
            title="Imprimer le ticket"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-warm ring-1 ring-sand transition-colors hover:bg-cream hover:text-crust"
          >
            <Printer size={15} />
          </button>
        </span>
      </div>

      {/* Le client a signalé son arrivée en boutique */}
      {commande.arrive && !livree && (
        <p className="mt-2">
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 ring-1 ring-emerald-200">
            Client sur place
          </span>
        </p>
      )}

      <ul className="mt-3 space-y-1 text-sm text-stone-warm">
        {commande.articles.map((a, i) => (
          <li key={i}>
            <span className="flex justify-between gap-2">
              <span className="text-ink">{a.nom}</span>
              <span className="tnum font-semibold">×{a.quantite}</span>
            </span>
            {/* Demande du client : bien visible pour ne pas la rater */}
            {a.remarque && (
              <span className="mt-0.5 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
                <MessageSquare size={12} /> {a.remarque}
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-3 border-t border-sand pt-3">
        <span className="price font-bold text-ink">{formatPrix(commande.total)}</span>

        {/* Les 3 étapes — grosses, lisibles, tactiles */}
        <div className="mt-2.5 grid grid-cols-3 gap-1.5">
          {ETAPES_STATUT.map((etape) => {
            const actif = commande.statut === etape.id
            const Icone = etape.icone
            return (
              <button
                key={etape.id}
                type="button"
                onClick={() => onStatut(etape.id)}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-[11px] font-bold transition-colors ${
                  actif
                    ? etape.actif
                    : 'bg-cream text-stone-warm ring-1 ring-sand hover:text-ink'
                }`}
              >
                <Icone size={16} />
                {etape.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// --- Emploi du temps : la journée par créneau, avec la charge de travail ---
function Planning({ commandes, creneaux }) {
  // Pour chaque créneau, on agrège ce qu'il y a à préparer
  const lignes = creneaux.map((creneau) => {
    const cmds = commandes.filter((c) => c.creneau === creneau && c.statut !== 'livree')
    const items = {}
    cmds.forEach((c) =>
      c.articles.forEach((a) => {
        items[a.nom] = (items[a.nom] || 0) + a.quantite
      }),
    )
    const totalItems = Object.values(items).reduce((n, v) => n + v, 0)
    let charge = 'Calme'
    let classeCharge = 'bg-emerald-50 text-emerald-700 ring-emerald-200'
    if (totalItems >= 6) {
      charge = 'Chargé'
      classeCharge = 'bg-rose-50 text-rose-600 ring-rose-200'
    } else if (totalItems >= 3) {
      charge = 'Modéré'
      classeCharge = 'bg-amber-50 text-ember ring-amber-200'
    }
    return { creneau, cmds, items, totalItems, charge, classeCharge }
  })

  return (
    <div>
      {/* Rappel des horaires d'ouverture */}
      <div className="mb-5 rounded-xl border border-sand bg-paper p-4">
        <p className="mb-2 text-sm font-semibold text-ink">Horaires d’aujourd’hui</p>
        <p className="text-sm text-stone-warm">La Pétrie · 07:00 – 20:00</p>
      </div>

      {/* Frise verticale des créneaux */}
      <div className="relative space-y-4 border-l-2 border-sand pl-5">
        {lignes.map((l) => (
          <div key={l.creneau} className="relative">
            {/* Point sur la frise */}
            <span className="absolute -left-[27px] top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-crust ring-4 ring-cream" />

            <div className="rounded-xl border border-sand bg-paper p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-lg text-ink">{l.creneau}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${l.classeCharge}`}>
                  {l.charge}
                </span>
              </div>
              <p className="mt-1 text-xs text-stone-warm">
                {l.cmds.length} commande{l.cmds.length > 1 ? 's' : ''} · {l.totalItems} article
                {l.totalItems > 1 ? 's' : ''} à préparer
              </p>

              {/* À préparer (agrégé) */}
              {l.totalItems > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {Object.entries(l.items).map(([nom, q]) => (
                    <span
                      key={nom}
                      className="rounded-lg bg-cream px-2.5 py-1 text-xs text-ink ring-1 ring-sand"
                    >
                      <span className="tnum font-semibold text-crust">{q}×</span> {nom}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {lignes.length === 0 && (
          <p className="text-sm text-stone-warm">Aucune commande planifiée pour le moment.</p>
        )}
      </div>
    </div>
  )
}

// --- Retrait : valider une commande en scannant le QR (caméra) ou en saisissant le numéro ---
function Retrait({ validerRetrait }) {
  const [code, setCode] = useState('')
  const [resultat, setResultat] = useState(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [erreurCamera, setErreurCamera] = useState(null)

  function traiter(valeur) {
    const r = validerRetrait(valeur)
    setResultat(r)
    if (r.ok) {
      setCode('')
      setCameraActive(false) // on ferme la caméra après un scan réussi
    }
  }

  function valider(e) {
    e.preventDefault()
    traiter(code)
  }

  // La caméra a détecté un ou plusieurs QR : on prend le premier
  function onScanCamera(codes) {
    const valeur = codes?.[0]?.rawValue
    if (valeur) traiter(valeur)
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-xl border border-sand bg-paper p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cream text-crust ring-1 ring-sand">
          <ScanLine size={26} />
        </div>
        <h2 className="mt-3 text-xl text-ink">Valider un retrait</h2>
        <p className="mt-1 text-sm text-stone-warm">
          Scannez le QR Code du client avec la caméra, ou saisissez son numéro.
        </p>

        {/* Caméra */}
        {cameraActive ? (
          <div className="mt-5">
            <div className="overflow-hidden rounded-xl border border-sand bg-ink">
              <Scanner
                onScan={onScanCamera}
                onError={(err) => setErreurCamera(err?.message || 'Caméra indisponible')}
                constraints={{ facingMode: 'environment' }}
                scanDelay={400}
              />
            </div>
            {erreurCamera && (
              <p className="mt-2 text-xs text-rose-600">
                {erreurCamera}. Autorisez la caméra, ou saisissez le numéro ci-dessous.
              </p>
            )}
            <button
              type="button"
              onClick={() => setCameraActive(false)}
              className="mt-3 w-full rounded-lg border border-sand bg-cream py-2.5 text-sm font-semibold text-ink transition-colors hover:border-crust/40"
            >
              Fermer la caméra
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setErreurCamera(null)
              setResultat(null)
              setCameraActive(true)
            }}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-crust py-3.5 font-semibold text-white transition-colors hover:bg-crust-dark active:scale-[0.99]"
          >
            <Camera size={18} /> Scanner avec la caméra
          </button>
        )}

        {/* Séparateur */}
        <div className="mt-4 flex items-center gap-3 text-xs text-stone-warm">
          <span className="h-px flex-1 bg-sand" /> ou saisir le numéro <span className="h-px flex-1 bg-sand" />
        </div>

        {/* Saisie manuelle */}
        <form onSubmit={valider} className="mt-3">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value)
              setResultat(null)
            }}
            placeholder="Ex : B41"
            className="w-full rounded-lg border border-sand bg-cream px-4 py-3 text-center text-lg font-semibold uppercase tracking-widest outline-none transition focus:border-crust focus:ring-2 focus:ring-crust/15"
          />
          <button
            type="submit"
            className="mt-3 w-full rounded-lg border border-sand bg-paper py-3 text-sm font-semibold text-ink transition-colors hover:border-crust/40"
          >
            Valider le numéro
          </button>
        </form>

        {/* Résultat */}
        {resultat?.ok && (
          <div className="mt-5 animate-pop-in rounded-xl bg-emerald-50 p-4 text-left ring-1 ring-emerald-200">
            <p className="flex items-center gap-2 font-semibold text-emerald-700">
              <CheckCircle2 size={18} /> Commande #{resultat.commande.numero} remise au client
            </p>
            <ul className="mt-2 space-y-0.5 text-sm text-emerald-800">
              {resultat.commande.articles.map((a, i) => (
                <li key={i}>
                  {a.quantite}× {a.nom}
                  {a.remarque && <em className="ml-1 font-semibold">→ {a.remarque}</em>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {resultat && !resultat.ok && (
          <div className="mt-5 rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
            {resultat.raison === 'introuvable' && 'Aucune commande ne correspond à ce code.'}
            {resultat.raison === 'deja' &&
              `La commande #${resultat.commande.numero} a déjà été récupérée.`}
            {resultat.raison === 'vide' && 'Saisissez un numéro de commande.'}
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-stone-warm">
        La caméra nécessite votre autorisation. Sur mobile, elle utilise l’appareil photo arrière.
      </p>
    </div>
  )
}

// --- Gestion des produits : liste + création + modification + suppression ---
function GestionProduits({
  produits,
  ajusterStock,
  marquerEpuise,
  remettreEnStock,
  ajouterProduit,
  mettreAJourProduit,
  supprimerProduit,
}) {
  // edition : null (fermé) | 'nouveau' | l'objet produit à modifier
  const [edition, setEdition] = useState(null)

  function valider(data) {
    if (edition === 'nouveau') ajouterProduit(data)
    else mettreAJourProduit(edition.id, data)
    setEdition(null)
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-stone-warm">
          {produits.length} produit{produits.length > 1 ? 's' : ''}
        </p>
        <button
          type="button"
          onClick={() => setEdition(edition ? null : 'nouveau')}
          className="inline-flex items-center gap-1.5 rounded-lg bg-crust px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-crust-dark"
        >
          {edition ? <X size={16} /> : <PlusCircle size={16} />}
          {edition ? 'Fermer' : 'Ajouter un produit'}
        </button>
      </div>

      {edition && (
        <ProductForm
          key={edition === 'nouveau' ? 'nouveau' : edition.id}
          produit={edition === 'nouveau' ? null : edition}
          onValider={valider}
          onAnnuler={() => setEdition(null)}
        />
      )}

      <div className="space-y-3">
        {produits.map((p) => (
          <LigneProduit
            key={p.id}
            produit={p}
            onMoins={() => ajusterStock(p.id, -1)}
            onPlus={() => ajusterStock(p.id, 1)}
            onEpuise={() => marquerEpuise(p.id)}
            onRemettre={() => remettreEnStock(p.id)}
            onModifier={() => setEdition(p)}
            onSupprimer={() => {
              if (window.confirm(`Supprimer « ${p.nom} » ? Cette action est définitive.`)) {
                supprimerProduit(p.id)
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}

// --- Formulaire de création / modification d'un produit ---
// "categorieParDefaut" permet de créer un produit directement dans une catégorie.
function ProductForm({ produit, onValider, onAnnuler, categorieParDefaut }) {
  const { categories } = useShop()
  const enEdition = !!produit
  const [nom, setNom] = useState(produit?.nom || '')
  const [categorie, setCategorie] = useState(produit?.categorie || categorieParDefaut || categories[0].id)
  const [sousCategorie, setSousCategorie] = useState(produit?.sousCategorie || '')
  const [prix, setPrix] = useState(produit ? String(produit.prix) : '')
  const [emoji, setEmoji] = useState(produit?.emoji || '')
  const [description, setDescription] = useState(produit?.description || '')
  const [delai, setDelai] = useState(String(produit?.delaiPreparation ?? 5))
  const [stock, setStock] = useState(String(produit?.stock ?? 10))
  const [image, setImage] = useState(produit?.image || '')
  const [nouveau, setNouveau] = useState(produit?.nouveau || false)
  const [populaire, setPopulaire] = useState(produit?.populaire || false)
  const [gouts, setGouts] = useState(produit?.gouts?.length ? produit.gouts : [])
  // Ingrédients et allergènes : saisis en texte, séparés par des virgules
  const [ingredients, setIngredients] = useState((produit?.ingredients || []).join(', '))
  const [allergenes, setAllergenes] = useState((produit?.allergenes || []).join(', '))

  const valide = nom.trim() && parseFloat(prix) > 0

  // Téléversement d'une photo -> on la lit en Base64 (stockée localement)
  function chargerPhoto(e) {
    const fichier = e.target.files?.[0]
    if (!fichier) return
    const lecteur = new FileReader()
    lecteur.onload = () => setImage(lecteur.result)
    lecteur.readAsDataURL(fichier)
  }

  function ajouterGout() {
    setGouts((g) => [...g, { nom: '', couleur: '#d98a3c' }])
  }
  function majGout(i, champ, valeur) {
    setGouts((g) => g.map((x, j) => (j === i ? { ...x, [champ]: valeur } : x)))
  }
  function retirerGout(i) {
    setGouts((g) => g.filter((_, j) => j !== i))
  }

  function soumettre(e) {
    e.preventDefault()
    if (!valide) return
    const cat = categories.find((c) => c.id === categorie)
    onValider({
      nom: nom.trim(),
      categorie,
      sousCategorie: sousCategorie.trim() || null,
      prix: parseFloat(prix),
      emoji: emoji.trim() || cat.emoji,
      from: cat.from,
      to: cat.to,
      image: image || null,
      description: description.trim(),
      ingredients: ingredients.split(',').map((x) => x.trim()).filter(Boolean),
      allergenes: allergenes.split(',').map((x) => x.trim()).filter(Boolean),
      delaiPreparation: parseInt(delai) || 5,
      stock: parseInt(stock) || 0,
      populaire,
      nouveau,
      gouts: gouts.filter((g) => g.nom.trim()).map((g) => ({ nom: g.nom.trim(), couleur: g.couleur })),
    })
  }

  const champ =
    'w-full rounded-lg border border-sand bg-cream px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-stone-warm/70 focus:border-crust focus:ring-2 focus:ring-crust/15'

  return (
    <form onSubmit={soumettre} className="mb-5 animate-pop-in rounded-xl border border-sand bg-paper p-4">
      <p className="mb-3 font-semibold text-ink">{enEdition ? `Modifier « ${produit.nom} »` : 'Nouveau produit'}</p>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Photo */}
        <div className="sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-stone-warm">Photo du produit</span>
          <div className="flex items-center gap-3">
            <div
              className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-sand"
              style={image ? undefined : { background: `linear-gradient(150deg, ${categories.find((c) => c.id === categorie)?.from}, ${categories.find((c) => c.id === categorie)?.to})` }}
            >
              {image ? (
                <img src={image} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl">{emoji || '🥖'}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-sand bg-cream px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-crust/40">
                <ImageIcon size={14} /> {image ? 'Changer la photo' : 'Téléverser une photo'}
                <input type="file" accept="image/*" onChange={chargerPhoto} className="hidden" />
              </label>
              {image && (
                <button type="button" onClick={() => setImage('')} className="w-fit text-xs font-medium text-rose-600 hover:underline">
                  Retirer la photo
                </button>
              )}
            </div>
          </div>
        </div>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-stone-warm">Nom *</span>
          <input className={champ} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Éclair" />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-stone-warm">Catégorie</span>
          <select className={champ} value={categorie} onChange={(e) => setCategorie(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-stone-warm">Sous-catégorie</span>
          <select className={champ} value={sousCategorie} onChange={(e) => setSousCategorie(e.target.value)}>
            <option value="">—</option>
            {(categories.find((c) => c.id === categorie)?.sousCategories || []).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-stone-warm">Prix (€) *</span>
          <input className={champ} type="number" step="0.1" min="0" value={prix} onChange={(e) => setPrix(e.target.value)} placeholder="2.50" />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-stone-warm">Stock</span>
          <input className={champ} type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-stone-warm">Délai de prépa (min)</span>
          <input className={champ} type="number" min="0" value={delai} onChange={(e) => setDelai(e.target.value)} />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-stone-warm">Emoji (si pas de photo)</span>
          <input className={champ} value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🥐" maxLength={4} />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-stone-warm">Description</span>
          <input className={champ} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Quelques mots sur le produit…" />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-stone-warm">
            Ingrédients <span className="font-normal">(séparés par des virgules)</span>
          </span>
          <input className={champ} value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="Farine de blé, Eau, Levain, Sel" />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-stone-warm">
            Allergènes <span className="font-normal">(séparés par des virgules)</span>
          </span>
          <input className={champ} value={allergenes} onChange={(e) => setAllergenes(e.target.value)} placeholder="Gluten, Sésame" />
        </label>
      </div>

      {/* Goûts disponibles (avec couleur pour la teinte du visuel) */}
      <div className="mt-4 rounded-lg border border-sand bg-cream p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-ink">Goûts disponibles</span>
          <button type="button" onClick={ajouterGout} className="inline-flex items-center gap-1 text-xs font-semibold text-crust hover:underline">
            <Plus size={13} /> Ajouter un goût
          </button>
        </div>
        {gouts.length === 0 ? (
          <p className="text-xs text-stone-warm">
            Ajoutez les goûts (ex : chocolat, vanille, fraise). La couleur choisie teinte
            le visuel du produit pour chaque goût.
          </p>
        ) : (
          <div className="space-y-2">
            {gouts.map((g, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="color"
                  value={g.couleur}
                  onChange={(e) => majGout(i, 'couleur', e.target.value)}
                  aria-label="Couleur du goût"
                  className="h-9 w-10 shrink-0 cursor-pointer rounded border border-sand bg-paper"
                />
                <input
                  className={champ}
                  value={g.nom}
                  onChange={(e) => majGout(i, 'nom', e.target.value)}
                  placeholder="Ex : Chocolat"
                />
                <button type="button" onClick={() => retirerGout(i)} aria-label="Retirer le goût" className="shrink-0 text-stone-warm hover:text-rose-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Étiquettes choisies par le boulanger */}
      <div className="mt-4 flex flex-wrap gap-4">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={nouveau} onChange={(e) => setNouveau(e.target.checked)} className="h-4 w-4 accent-crust" />
          Nouveauté
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={populaire} onChange={(e) => setPopulaire(e.target.checked)} className="h-4 w-4 accent-crust" />
          Populaire
        </label>
      </div>

      <div className="mt-4 flex gap-2">
        {onAnnuler && (
          <button type="button" onClick={onAnnuler} className="rounded-lg border border-sand bg-cream px-4 py-3 text-sm font-semibold text-ink transition-colors hover:border-crust/40">
            Annuler
          </button>
        )}
        <button
          type="submit"
          disabled={!valide}
          className="flex-1 rounded-lg bg-crust py-3 font-semibold text-white transition-colors hover:bg-crust-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-sand disabled:text-stone-warm"
        >
          {enEdition ? 'Enregistrer les modifications' : 'Créer le produit'}
        </button>
      </div>
    </form>
  )
}

// --- Gestion des catégories et sous-catégories ---
function GestionCategories({
  categories,
  produits,
  ajouterCategorie,
  supprimerCategorie,
  ajouterSousCategorie,
  supprimerSousCategorie,
  ajouterProduit,
}) {
  const [formOuvert, setFormOuvert] = useState(false)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-stone-warm">
          {categories.length} catégorie{categories.length > 1 ? 's' : ''}
        </p>
        <button
          type="button"
          onClick={() => setFormOuvert((o) => !o)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-crust px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-crust-dark"
        >
          {formOuvert ? <X size={16} /> : <PlusCircle size={16} />}
          {formOuvert ? 'Fermer' : 'Ajouter une catégorie'}
        </button>
      </div>

      {formOuvert && (
        <CategorieForm
          onAjouter={(data) => {
            ajouterCategorie(data)
            setFormOuvert(false)
          }}
        />
      )}

      <div className="space-y-4">
        {categories.map((c) => (
          <CategorieCard
            key={c.id}
            categorie={c}
            produitsCategorie={produits.filter((p) => p.categorie === c.id)}
            onAjouterProduit={ajouterProduit}
            onSupprimer={() => {
              const n = produits.filter((p) => p.categorie === c.id).length
              const msg = n > 0
                ? `Supprimer « ${c.nom} » ? ${n} produit(s) y sont rattachés (ils resteront mais sans catégorie).`
                : `Supprimer la catégorie « ${c.nom} » ?`
              if (window.confirm(msg)) supprimerCategorie(c.id)
            }}
            onAjouterSous={(nom) => ajouterSousCategorie(c.id, nom)}
            onSupprimerSous={(nom) => supprimerSousCategorie(c.id, nom)}
          />
        ))}
      </div>
    </div>
  )
}

// Formulaire de création d'une catégorie (avec photo facultative)
function CategorieForm({ onAjouter }) {
  const [nom, setNom] = useState('')
  const [emoji, setEmoji] = useState('')
  const [image, setImage] = useState('')
  const [from, setFrom] = useState('#e9b872')
  const [to, setTo] = useState('#c98a3a')

  const champ =
    'w-full rounded-lg border border-sand bg-cream px-3 py-2.5 text-sm text-ink outline-none transition placeholder:text-stone-warm/70 focus:border-crust focus:ring-2 focus:ring-crust/15'

  function chargerPhoto(e) {
    const fichier = e.target.files?.[0]
    if (!fichier) return
    const lecteur = new FileReader()
    lecteur.onload = () => setImage(lecteur.result)
    lecteur.readAsDataURL(fichier)
  }

  function soumettre(e) {
    e.preventDefault()
    if (!nom.trim()) return
    onAjouter({ nom, emoji, from, to, image: image || null })
  }

  return (
    <form onSubmit={soumettre} className="mb-5 animate-pop-in rounded-xl border border-sand bg-paper p-4">
      <p className="mb-3 font-semibold text-ink">Nouvelle catégorie</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-stone-warm">Nom *</span>
          <input className={champ} value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex : Viennoiseries" />
        </label>

        {/* Photo de la catégorie */}
        <div className="sm:col-span-2">
          <span className="mb-1 block text-xs font-medium text-stone-warm">Photo</span>
          <div className="flex items-center gap-3">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-sand bg-white"
              style={image ? undefined : { background: `linear-gradient(150deg, ${from}, ${to})` }}
            >
              {image ? (
                <img src={image} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl">{emoji || '🥐'}</span>
              )}
            </div>
            <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-sand bg-cream px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-crust/40">
              <ImageIcon size={14} /> {image ? 'Changer la photo' : 'Téléverser une photo'}
              <input type="file" accept="image/*" onChange={chargerPhoto} className="hidden" />
            </label>
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-stone-warm">Emoji (si pas de photo)</span>
          <input className={champ} value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🥐" maxLength={4} />
        </label>
        <div className="flex items-end gap-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-warm">Couleur 1</span>
            <input type="color" value={from} onChange={(e) => setFrom(e.target.value)} className="h-10 w-14 cursor-pointer rounded border border-sand bg-paper" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-stone-warm">Couleur 2</span>
            <input type="color" value={to} onChange={(e) => setTo(e.target.value)} className="h-10 w-14 cursor-pointer rounded border border-sand bg-paper" />
          </label>
          <div className="h-10 flex-1 rounded-lg border border-sand" style={{ background: `linear-gradient(150deg, ${from}, ${to})` }} />
        </div>
      </div>
      <button
        type="submit"
        disabled={!nom.trim()}
        className="mt-4 w-full rounded-lg bg-crust py-3 font-semibold text-white transition-colors hover:bg-crust-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-sand disabled:text-stone-warm"
      >
        Créer la catégorie
      </button>
    </form>
  )
}

// Carte d'une catégorie : son illustration, ses produits en images,
// un bouton pour ajouter un produit directement dedans, et ses sous-catégories.
function CategorieCard({
  categorie,
  produitsCategorie,
  onAjouterProduit,
  onSupprimer,
  onAjouterSous,
  onSupprimerSous,
}) {
  const [nouvelleSous, setNouvelleSous] = useState('')
  const [formProduit, setFormProduit] = useState(false)

  function ajouterSous(e) {
    e.preventDefault()
    if (!nouvelleSous.trim()) return
    onAjouterSous(nouvelleSous)
    setNouvelleSous('')
  }

  return (
    <div className="overflow-hidden rounded-xl border border-sand bg-paper">
      {/* En-tête : illustration + nom */}
      <div className="flex items-center gap-3 border-b border-sand-soft p-4">
        <span
          className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-2xl text-white ring-1 ring-sand"
          style={categorie.image ? undefined : { background: `linear-gradient(150deg, ${categorie.from}, ${categorie.to})` }}
        >
          {categorie.image ? (
            <img src={categorie.image} alt="" className="h-full w-full object-contain p-1" />
          ) : (
            categorie.emoji
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg text-ink">{categorie.nom}</p>
          <p className="text-xs text-stone-warm">
            {produitsCategorie.length} produit{produitsCategorie.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onSupprimer}
          aria-label={`Supprimer ${categorie.nom}`}
          className="shrink-0 text-stone-warm transition-colors hover:text-rose-600"
        >
          <Trash2 size={17} />
        </button>
      </div>

      {/* Les produits de la catégorie, en images + bouton d'ajout direct */}
      <div className="flex flex-wrap items-center gap-2 p-4">
        {produitsCategorie.map((p) => (
          <span
            key={p.id}
            title={`${p.nom} — ${formatPrix(p.prix)}`}
            className={`flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-white text-2xl ring-1 ring-sand ${
              p.disponible ? '' : 'opacity-40 grayscale'
            }`}
            style={p.image ? undefined : { background: `linear-gradient(150deg, ${p.from}, ${p.to})` }}
          >
            {p.image ? (
              <img src={p.image} alt={p.nom} className="h-full w-full object-contain p-1" />
            ) : (
              p.emoji
            )}
          </span>
        ))}

        <button
          type="button"
          onClick={() => setFormProduit((o) => !o)}
          aria-label={`Ajouter un produit dans ${categorie.nom}`}
          className={`flex h-14 w-14 flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed text-[9px] font-bold uppercase transition-colors ${
            formProduit
              ? 'border-crust text-crust'
              : 'border-sand text-stone-warm hover:border-crust/50 hover:text-crust'
          }`}
        >
          {formProduit ? <X size={17} /> : <PlusCircle size={17} />}
          Produit
        </button>
      </div>

      {/* Formulaire produit, pré-rempli sur CETTE catégorie */}
      {formProduit && (
        <div className="border-t border-sand-soft p-4">
          <ProductForm
            categorieParDefaut={categorie.id}
            onValider={(data) => {
              onAjouterProduit(data)
              setFormProduit(false)
            }}
            onAnnuler={() => setFormProduit(false)}
          />
        </div>
      )}

      {/* Sous-catégories */}
      <div className="border-t border-sand-soft p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-warm">
          Sous-catégories
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {categorie.sousCategories.length === 0 ? (
            <span className="text-xs text-stone-warm">Aucune sous-catégorie</span>
          ) : (
            categorie.sousCategories.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-cream px-2.5 py-1 text-xs font-medium text-ink ring-1 ring-sand">
                {s}
                <button type="button" onClick={() => onSupprimerSous(s)} aria-label={`Retirer ${s}`} className="text-stone-warm hover:text-rose-600">
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>

        <form onSubmit={ajouterSous} className="mt-3 flex gap-2">
          <input
            value={nouvelleSous}
            onChange={(e) => setNouvelleSous(e.target.value)}
            placeholder="Nouvelle sous-catégorie…"
            className="flex-1 rounded-lg border border-sand bg-cream px-3 py-2 text-sm text-ink outline-none transition placeholder:text-stone-warm/70 focus:border-crust focus:ring-2 focus:ring-crust/15"
          />
          <button type="submit" className="inline-flex items-center gap-1 rounded-lg border border-sand bg-cream px-3 py-2 text-sm font-semibold text-ink transition-colors hover:border-crust/40">
            <Plus size={15} /> Ajouter
          </button>
        </form>
      </div>
    </div>
  )
}

// --- Ligne produit (disponibilité + modification + suppression) ---
function LigneProduit({ produit, onMoins, onPlus, onEpuise, onRemettre, onModifier, onSupprimer }) {
  const epuise = !produit.disponible

  return (
    <div className="flex items-center gap-3 rounded-xl border border-sand bg-paper p-3">
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg text-2xl ${
          epuise ? 'opacity-40 grayscale' : ''
        }`}
        style={produit.image ? undefined : { background: `linear-gradient(150deg, ${produit.from}, ${produit.to})` }}
      >
        {produit.image ? (
          <img src={produit.image} alt="" className="h-full w-full object-cover" />
        ) : (
          produit.emoji
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-ink">{produit.nom}</p>
        {epuise ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
            <XCircle size={13} /> Épuisé
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={13} /> En stock : {produit.stock}
          </span>
        )}
      </div>

      {epuise ? (
        <button
          type="button"
          onClick={onRemettre}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
        >
          <RotateCcw size={14} /> Remettre en stock
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-sand bg-cream">
            <button
              type="button"
              aria-label="Diminuer le stock"
              onClick={onMoins}
              className="flex h-8 w-8 items-center justify-center text-stone-warm transition-colors hover:text-ink"
            >
              <Minus size={15} />
            </button>
            <span className="tnum w-7 text-center text-sm font-bold">{produit.stock}</span>
            <button
              type="button"
              aria-label="Augmenter le stock"
              onClick={onPlus}
              className="flex h-8 w-8 items-center justify-center text-stone-warm transition-colors hover:text-ink"
            >
              <Plus size={15} />
            </button>
          </div>
          <button
            type="button"
            onClick={onEpuise}
            className="rounded-lg px-3 py-2 text-xs font-semibold text-rose-600 ring-1 ring-rose-200 transition-colors hover:bg-rose-50"
          >
            Épuisé
          </button>
        </div>
      )}

      {/* Modifier le produit */}
      <button
        type="button"
        onClick={onModifier}
        aria-label={`Modifier ${produit.nom}`}
        className="ml-1 shrink-0 text-stone-warm transition-colors hover:text-crust"
      >
        <Pencil size={16} />
      </button>

      {/* Supprimer le produit (avec confirmation) */}
      <button
        type="button"
        onClick={onSupprimer}
        aria-label={`Supprimer ${produit.nom}`}
        className="shrink-0 text-stone-warm transition-colors hover:text-rose-600"
      >
        <Trash2 size={17} />
      </button>
    </div>
  )
}
