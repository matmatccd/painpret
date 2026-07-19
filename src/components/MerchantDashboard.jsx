import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Clock,
  Euro,
  Package,
  ClipboardList,
  QrCode,
  ScanLine,
  Camera,
  ChefHat,
  PackageCheck,
  Printer,
  LayoutDashboard,
  LogOut,
  Wheat,
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
  Ban,
  TrendingUp,
  Trophy,
  BellRing,
  Phone,
  Download,
  Undo2,
} from 'lucide-react'
import { Scanner } from '@yudiel/react-qr-scanner'
import AssistantFournil from './AssistantFournil'
import { IllustrationPain } from './Illustrations'
import { useShop } from '../context/ShopContext'
import { bakery } from '../data/bakery'
import { resolveImage } from '../data/images'
import { permissionNotif, demanderPermissionNotif, notifierCommande, activerPush } from '../lib/notifPro'
import { formatPrix } from '../lib/format'
import { jouerCarillon } from '../lib/son'

// Imprime un REÇU de la commande : articles avec prix, total, date,
// coordonnées de la boutique — la preuve d'achat du client.
function imprimerTicket(commande) {
  const euros = (n) => n.toFixed(2).replace('.', ',') + ' €'
  const lignes = commande.articles
    .map(
      (a) =>
        `<tr><td>${a.quantite} ×</td><td>${a.nom}${
          a.remarque ? `<br><em>→ ${a.remarque}</em>` : ''
        }</td><td class="prix">${a.prix != null ? euros(a.prix * a.quantite) : ''}</td></tr>`,
    )
    .join('')
  const quand = new Date(commande.date ?? Date.now()).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Reçu #${commande.numero}</title>
    <style>
      body { font-family: -apple-system, sans-serif; width: 260px; margin: 0 auto; padding: 12px; color: #000; }
      h1 { font-size: 16px; text-align: center; margin: 0; }
      p { text-align: center; margin: 4px 0; font-size: 12px; }
      hr { border: none; border-top: 1px dashed #000; margin: 10px 0; }
      table { width: 100%; font-size: 13px; border-collapse: collapse; }
      td { padding: 3px 4px 3px 0; vertical-align: top; }
      td.prix { text-align: right; white-space: nowrap; }
      .total { font-weight: bold; font-size: 15px; display: flex; justify-content: space-between; }
      .numero { font-size: 22px; font-weight: bold; text-align: center; margin: 8px 0; }
      .titre { text-align: center; font-size: 11px; letter-spacing: 2px; margin-top: 8px; }
    </style></head><body>
    <h1>La Pétrie</h1>
    <p>${bakery.slogan} — ${bakery.equipe}</p>
    <p>${bakery.adresse}, ${bakery.ville}</p>
    <p>Tél. ${bakery.telephone}</p>
    <p class="titre">— REÇU DE PAIEMENT —</p>
    <div class="numero">#${commande.numero}</div>
    <p>${quand}</p>
    ${commande.client ? `<p>Client : <strong>${commande.client}</strong></p>` : ''}
    ${commande.telephone ? `<p>Tel : ${commande.telephone}</p>` : ''}
    ${commande.email ? `<p>${commande.email}</p>` : ''}
    <p>Retrait : <strong>${commande.creneau}</strong></p>
    <hr><table>${lignes}</table><hr>
    <div class="total"><span>TOTAL</span><span>${euros(commande.total)}</span></div>
    <p style="text-align:left;margin-top:6px">TVA incluse · Réglé en boutique</p>
    <hr><p>Merci de votre visite, à bientôt !</p>
    </body></html>`

  const fenetre = window.open('', '_blank', 'width=320,height=520')
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
    boutiqueFermee,
    basculerFermeture,
    pauseJusqua,
    basculerPause,
  } = useShop()

  // L'onglet "Aujourd'hui" est l'écran d'accueil du boulanger : l'essentiel en un coup d'œil.
  const [onglet, setOnglet] = useState('jour')

  // État de l'autorisation des notifications système
  const [permNotif, setPermNotif] = useState(() => permissionNotif())
  async function activerAlertes() {
    const p = await demanderPermissionNotif()
    setPermNotif(p)
    // Si accordé : on abonne aussi cet appareil aux notifications "appli fermée"
    if (p === 'granted') activerPush()
  }

  // Si déjà autorisé au chargement, on (ré)abonne l'appareil au push
  useEffect(() => {
    if (permNotif === 'granted') activerPush()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Carillon + notification système quand une NOUVELLE commande arrive
  // pendant que l'espace est ouvert (même onglet en arrière-plan).
  const idsConnus = useRef(null)
  useEffect(() => {
    const ids = commandes.map((c) => c.id)
    if (idsConnus.current === null) {
      // premier affichage : on ne sonne pas pour les commandes existantes
      idsConnus.current = new Set(ids)
      return
    }
    const nouvelles = commandes.filter((c) => !idsConnus.current.has(c.id))
    if (nouvelles.length > 0) {
      jouerCarillon()
      nouvelles.forEach((c) => notifierCommande(c))
    }
    idsConnus.current = new Set(ids)
  }, [commandes])

  // Commandes en cours et livrées, séparées pour ne pas encombrer l'écran
  const commandesEnCours = commandes.filter((c) => c.statut !== 'livree')
  const commandesLivrees = commandes.filter((c) => c.statut === 'livree')
  // Créneaux des commandes EN COURS, triés par heure
  const creneaux = [...new Set(commandesEnCours.map((c) => c.creneau))].sort()

  const commandesActives = commandesEnCours.length
  const clientsSurPlace = commandesEnCours.filter((c) => c.arrive).length
  const produitsEpuises = produits.filter((p) => !p.disponible).length

  return (
    <div className="min-h-dvh bg-cream">
      {/* En-tête de l'espace boulanger — le flux de l'enseigne, comme le site client */}
      <header className="sticky top-0 z-40 overflow-hidden border-b-2 border-[#e9cd90]/40 text-white">
        <div className="flux-petrie absolute inset-0" />
        <div className="absolute inset-0 bg-[#1f0c19]/45" />
        <div className="relative mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
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
            {permNotif !== 'granted' && (
              <button
                type="button"
                onClick={activerAlertes}
                title={permNotif === 'denied'
                  ? 'Notifications bloquées — autorisez-les dans les réglages du navigateur'
                  : 'Recevoir une alerte à chaque nouvelle commande'}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#e9cd90] px-3 py-2 text-sm font-semibold text-crust-dark transition-colors hover:bg-[#f7e8c4]"
              >
                <BellRing size={16} />
                <span className="hidden sm:inline">Activer les alertes</span>
              </button>
            )}
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
          <Indicateur valeur={clientsSurPlace} label="Clients sur place" />
          <Indicateur valeur={produitsEpuises} label="Produits épuisés" />
        </div>

        {/* 4 onglets simples — gros, tous visibles, faciles à taper */}
        <div className="mb-6 grid grid-cols-4 gap-1 rounded-xl border border-sand bg-paper p-1">
          <BoutonOnglet actif={onglet === 'jour'} onClick={() => setOnglet('jour')} icone={<LayoutDashboard size={19} />}>
            Aujourd'hui
          </BoutonOnglet>
          <BoutonOnglet actif={onglet === 'commandes'} onClick={() => setOnglet('commandes')} icone={<ClipboardList size={19} />} badge={commandesActives}>
            Commandes
          </BoutonOnglet>
          <BoutonOnglet actif={onglet === 'retrait'} onClick={() => setOnglet('retrait')} icone={<QrCode size={19} />}>
            Scanner
          </BoutonOnglet>
          <BoutonOnglet actif={onglet === 'produits'} onClick={() => setOnglet('produits')} icone={<Package size={19} />}>
            Mes produits
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
            boutiqueFermee={boutiqueFermee}
            basculerFermeture={basculerFermeture}
            pauseJusqua={pauseJusqua}
            basculerPause={basculerPause}
          />
        )}

        {/* ---------- COMMANDES (la journée, créneau par créneau) ---------- */}
        {onglet === 'commandes' && (
          <div className="space-y-6">
            {creneaux.length === 0 ? (
              <EtatVide illustration={<IllustrationPain />} titre="Aucune commande en cours" texte="Les nouvelles commandes des clients apparaîtront ici." />
            ) : (
              creneaux.map((creneau) => {
                const cmdsDuCreneau = commandesEnCours.filter((c) => c.creneau === creneau)
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
              })
            )}

            {/* Les commandes livrées, repliées pour ne pas encombrer */}
            {commandesLivrees.length > 0 && (
              <details className="rounded-xl border border-sand bg-paper">
                <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3.5 font-semibold text-stone-warm [&::-webkit-details-marker]:hidden">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Commandes livrées ({commandesLivrees.length}) — toucher pour afficher
                </summary>
                <div className="grid gap-3 border-t border-sand-soft p-4 sm:grid-cols-2">
                  {commandesLivrees.map((cmd) => (
                    <CarteCommande key={cmd.id} commande={cmd} onStatut={(st) => changerStatut(cmd.id, st)} />
                  ))}
                </div>
              </details>
            )}
          </div>
        )}

        {/* ---------- RETRAIT (scan QR) ---------- */}
        {onglet === 'retrait' && <Retrait validerRetrait={validerRetrait} />}

        {/* ---------- MES PRODUITS (rangés par catégorie) ---------- */}
        {onglet === 'produits' && (
          <GestionProduits
            produits={produits}
            categories={categories}
            ajusterStock={ajusterStock}
            marquerEpuise={marquerEpuise}
            remettreEnStock={remettreEnStock}
            ajouterProduit={ajouterProduit}
            mettreAJourProduit={mettreAJourProduit}
            supprimerProduit={supprimerProduit}
            ajouterCategorie={ajouterCategorie}
            supprimerCategorie={supprimerCategorie}
            ajouterSousCategorie={ajouterSousCategorie}
            supprimerSousCategorie={supprimerSousCategorie}
          />
        )}
        </div>
      </div>
    </div>
  )
}

// --- Export comptable : les commandes du mois en CSV (ouvrable dans Excel) ---
const STATUTS_LISIBLES = { 'a-preparer': 'A preparer', prete: 'Prete', livree: 'Livree' }
function exporterCommandesCSV(commandes) {
  const debutMois = new Date()
  debutMois.setDate(1)
  debutMois.setHours(0, 0, 0, 0)
  const duMois = commandes.filter((c) => (c.date ?? 0) >= debutMois.getTime())

  const lignes = [
    ['Numero', 'Date', 'Retrait', 'Client', 'Telephone', 'Email', 'Articles', 'Total (EUR)', 'Statut', 'Remboursee', 'Paiement Stripe'],
    ...duMois.map((c) => [
      c.numero,
      new Date(c.date).toLocaleString('fr-FR'),
      c.creneau,
      c.client,
      c.telephone,
      c.email,
      (c.articles || []).map((a) => `${a.quantite}x ${a.nom}`).join(' | '),
      String(c.total).replace('.', ','),
      STATUTS_LISIBLES[c.statut] || c.statut,
      c.remboursee ? 'Oui' : '',
      c.stripeSession || '',
    ]),
  ]
  // BOM UTF-8 + point-virgule : accents et colonnes corrects dans Excel français
  const csv =
    '\ufeff' +
    lignes.map((l) => l.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `painpret-commandes-${new Date().toISOString().slice(0, 7)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

// --- Nombre qui "compte" jusqu'à sa valeur (effet caisse enregistreuse) ---
function NombreAnime({ valeur, rendu = (v) => v }) {
  const [affiche, setAffiche] = useState(valeur)
  const precedent = useRef(valeur)
  useEffect(() => {
    const depart = precedent.current
    precedent.current = valeur
    if (depart === valeur) return
    const debut = performance.now()
    let raf
    const tick = (t) => {
      const p = Math.min(1, (t - debut) / 700)
      const doux = 1 - Math.pow(1 - p, 3)
      setAffiche(depart + (valeur - depart) * doux)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [valeur])
  return <>{rendu(affiche)}</>
}

// --- Petit état vide réutilisable (illustration maison si fournie, sinon icône) ---
function EtatVide({ icone: Icone = ClipboardList, titre, texte, illustration = null }) {
  return (
    <div className="rounded-xl border border-dashed border-sand bg-paper px-6 py-12 text-center">
      {illustration ? (
        <span className="illustration-vide mx-auto block w-fit">{illustration}</span>
      ) : (
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream text-crust ring-1 ring-sand">
          <Icone size={26} />
        </span>
      )}
      <p className="mt-3 font-display text-lg text-ink">{titre}</p>
      <p className="mt-1 text-sm text-stone-warm">{texte}</p>
    </div>
  )
}

// --- Indicateur (le chiffre "compte" quand il change) ---
function Indicateur({ valeur, label }) {
  return (
    <div className="rounded-xl border border-sand bg-paper p-4 shadow-[0_2px_10px_-6px_rgba(52,34,47,0.15)]">
      <p className="font-display text-2xl text-ink">
        <NombreAnime valeur={valeur} rendu={(v) => Math.round(v)} />
      </p>
      <p className="mt-0.5 text-xs text-stone-warm">{label}</p>
    </div>
  )
}

// --- Onglet (avec pastille de compteur facultative) ---
// Gros bouton tactile : icône au-dessus du nom sur téléphone, côte à côte
// sur grand écran. Les 4 restent toujours visibles (pas de défilement).
function BoutonOnglet({ actif, onClick, icone, badge, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-1 rounded-lg px-1 py-2.5 text-[11px] font-semibold leading-tight transition-colors sm:flex-row sm:gap-2 sm:px-3 sm:text-sm ${
        actif ? 'bg-ink text-white' : 'text-stone-warm hover:bg-cream hover:text-ink'
      }`}
    >
      {icone}
      <span className="truncate">{children}</span>
      {badge > 0 && (
        <span
          className={`absolute -top-1.5 right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold sm:static ${
            actif ? 'bg-white text-ink' : 'bg-ember text-white'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  )
}

// --- "Aujourd'hui" : l'essentiel de la journée en un coup d'œil ---
function VueDuJour({ commandes, produits, changerStatut, ajusterStock, remettreEnStock, allerVoir, boutiqueFermee, basculerFermeture, pauseJusqua, basculerPause }) {
  // Pause du fournil : minutes restantes (rafraîchies toutes les 30 s)
  const [, setTic] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTic((n) => n + 1), 30000)
    return () => clearInterval(t)
  }, [])
  const finPause = pauseJusqua ? new Date(pauseJusqua).getTime() : 0
  const minutesPause = Math.max(0, Math.ceil((finPause - Date.now()) / 60000))
  const [erreurPause, setErreurPause] = useState('')
  async function togglePause() {
    setErreurPause('')
    try {
      await basculerPause(30)
    } catch (e) {
      setErreurPause(e?.message || String(e))
    }
  }
  const actives = commandes.filter((c) => c.statut !== 'livree')
  // Chiffre d'affaires du jour : toutes les commandes sont payées en ligne
  const caJour = commandes.reduce((somme, c) => somme + c.total, 0)
  const nbLivrees = commandes.filter((c) => c.statut === 'livree').length

  // --- Cette semaine (depuis lundi) ---
  const debutSemaine = new Date()
  debutSemaine.setHours(0, 0, 0, 0)
  const jourJS = debutSemaine.getDay() // 0 = dimanche
  debutSemaine.setDate(debutSemaine.getDate() - (jourJS === 0 ? 6 : jourJS - 1))
  const commandesSemaine = commandes.filter((c) => (c.date ?? Date.now()) >= debutSemaine.getTime())
  const caSemaine = commandesSemaine.reduce((somme, c) => somme + c.total, 0)

  // --- Produits les plus vendus (toutes commandes confondues) ---
  const compteur = {}
  commandesSemaine.forEach((c) => {
    c.articles.forEach((a) => {
      compteur[a.nom] = (compteur[a.nom] || 0) + a.quantite
    })
  })
  const topProduits = Object.entries(compteur)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  // --- Le chiffre d'affaires des 7 derniers jours (pour le petit graphique) ---
  const jours7 = [...Array(7)].map((_, i) => {
    const debut = new Date()
    debut.setHours(0, 0, 0, 0)
    debut.setDate(debut.getDate() - (6 - i))
    const fin = debut.getTime() + 86400000
    const ca = commandes
      .filter((c) => (c.date ?? 0) >= debut.getTime() && (c.date ?? 0) < fin)
      .reduce((somme, c) => somme + c.total, 0)
    return {
      label: debut.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''),
      ca,
      aujourdhui: i === 6,
    }
  })
  const maxCA7 = Math.max(1, ...jours7.map((j) => j.ca))
  // Clients qui ont signalé leur arrivée : à servir en priorité
  const surPlace = actives.filter((c) => c.arrive)
  // Prochain créneau à préparer
  const prochainCreneau = [...new Set(actives.map((c) => c.creneau))].sort()[0]
  const aPreparer = actives.filter((c) => c.creneau === prochainCreneau)
  // Stock bas ou épuisé : à surveiller
  const stockBas = produits.filter((p) => p.stock <= 3)

  // Le total à sortir du four, tous créneaux confondus : le boulanger voit
  // d'un coup d'œil combien de chaque pain préparer, sans lire commande
  // par commande.
  const totaux = {}
  actives
    .filter((c) => c.statut === 'a-preparer')
    .forEach((c) => {
      ;(c.articles || []).forEach((a) => {
        if (!totaux[a.nom]) totaux[a.nom] = { nom: a.nom, quantite: 0, produitId: a.produitId }
        totaux[a.nom].quantite += a.quantite || 0
      })
    })
  const aSortir = Object.values(totaux).sort((x, y) => y.quantite - x.quantite)
  const totalPieces = aSortir.reduce((n, p) => n + p.quantite, 0)

  return (
    <div className="space-y-8">
      {/* Boutique fermée exceptionnellement : bannière bien visible en haut */}
      {boutiqueFermee && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-rose-50 p-4 ring-1 ring-rose-200">
          <p className="flex items-center gap-2 font-semibold text-rose-700">
            <Ban size={18} /> Boutique fermée — les clients ne peuvent plus commander
          </p>
          <button
            type="button"
            onClick={basculerFermeture}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
          >
            Rouvrir les commandes
          </button>
        </section>
      )}

      {/* Pause du fournil en cours : bannière + reprise en un tap */}
      {minutesPause > 0 && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
          <p className="flex items-center gap-2 font-semibold text-amber-800">
            <Clock size={18} /> Pause en cours — les créneaux clients sont décalés de {minutesPause} min
          </p>
          <button
            type="button"
            onClick={togglePause}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700"
          >
            Reprendre maintenant
          </button>
        </section>
      )}

      {/* 0. L'assistant du fournil : conseils calculés sur les vraies ventes */}
      <AssistantFournil commandes={commandes} produits={produits} ajusterStock={ajusterStock} />

      {/* 0 bis. LE TOTAL À SORTIR : combien de chaque pain, toutes commandes
             confondues — l'info n°1 quand on enfourne. */}
      {aSortir.length > 0 && (
        <section className="overflow-hidden rounded-2xl border-2 border-crust/25 bg-paper">
          <div className="flex items-center justify-between gap-3 border-b border-sand bg-cream px-4 py-3">
            <h2 className="flex items-center gap-2 text-lg text-ink">
              <ChefHat size={19} className="text-crust" /> À sortir du four
            </h2>
            <span className="rounded-full bg-crust px-3 py-1 text-sm font-bold text-white">
              {totalPieces} pièce{totalPieces > 1 ? 's' : ''}
            </span>
          </div>
          <ul className="divide-y divide-sand-soft">
            {aSortir.map((p) => {
              const produit = produits.find((x) => x.id === p.produitId)
              return (
                <li key={p.nom} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-sand">
                    {produit?.image ? (
                      <img src={produit.image} alt="" className="h-full w-full object-contain p-0.5" />
                    ) : (
                      <ChefHat size={18} className="text-crust" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-semibold text-ink">{p.nom}</span>
                  <span className="tnum shrink-0 font-display text-2xl text-crust">×{p.quantite}</span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

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
          <EtatVide illustration={<IllustrationPain />} titre="Rien à préparer" texte="Les nouvelles commandes en ligne apparaîtront ici." />
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

      {/* 4. La caisse : aujourd'hui + cette semaine */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg text-ink">
            <Euro size={18} className="text-crust" /> La caisse
          </h2>
          {/* Export comptable : toutes les commandes du mois, en fichier
              CSV lisible par Excel (pour les dossiers / le comptable) */}
          <button
            type="button"
            onClick={() => exporterCommandesCSV(commandes)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sand bg-paper px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:border-crust/40 hover:text-crust"
          >
            <Download size={14} /> Exporter le mois (Excel)
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-sand bg-paper p-4">
            <div>
              <p className="text-xs font-medium text-stone-warm">Aujourd'hui</p>
              <p className="price mt-0.5 font-display text-3xl text-ink">
                <NombreAnime valeur={caJour} rendu={(v) => formatPrix(v)} />
              </p>
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
          </div>

          <div className="rounded-xl border border-sand bg-paper p-4">
            <p className="flex items-center gap-1.5 text-xs font-medium text-stone-warm">
              <TrendingUp size={13} /> Cette semaine (depuis lundi)
            </p>
            <p className="price mt-0.5 font-display text-3xl text-ink">
              <NombreAnime valeur={caSemaine} rendu={(v) => formatPrix(v)} />
            </p>
            <p className="text-xs text-stone-warm">
              {commandesSemaine.length} commande{commandesSemaine.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* La tendance : le CA de chacun des 7 derniers jours */}
        <div className="mt-3 rounded-xl border border-sand bg-paper p-4">
          <p className="mb-3 text-xs font-medium text-stone-warm">Les 7 derniers jours</p>
          <div className="flex items-end gap-2">
            {jours7.map((j, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="tnum text-[10px] text-stone-warm">
                  {j.ca > 0 ? Math.round(j.ca) + '€' : ''}
                </span>
                <div className="flex h-16 w-full items-end">
                  <div
                    className={`w-full rounded-t-md transition-[height] duration-500 ${
                      j.aujourdhui ? 'bg-crust' : 'bg-sand'
                    }`}
                    style={{ height: `${Math.max(j.ca > 0 ? 8 : 3, (j.ca / maxCA7) * 100)}%` }}
                  />
                </div>
                <span
                  className={`text-[10px] font-semibold capitalize ${
                    j.aujourdhui ? 'text-crust' : 'text-stone-warm'
                  }`}
                >
                  {j.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Les produits les plus vendus de la semaine */}
        {topProduits.length > 0 && (
          <div className="mt-3 rounded-xl border border-sand bg-paper p-4">
            <p className="mb-2.5 flex items-center gap-1.5 text-xs font-medium text-stone-warm">
              <Trophy size={13} className="text-gilt" /> Les plus vendus cette semaine
            </p>
            <ol className="space-y-1.5">
              {topProduits.map(([nom, quantite], i) => (
                <li key={nom} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 text-ink">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                        ['bg-gilt', 'bg-stone-warm', 'bg-[#b0713e]'][i]
                      }`}
                    >
                      {i + 1}
                    </span>
                    {nom}
                  </span>
                  <span className="tnum font-semibold text-stone-warm">×{quantite}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* 4 bis. Coup de feu : une pause de 30 min qui décale les créneaux,
             puis tout redémarre tout seul. */}
      {minutesPause === 0 && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sand bg-paper p-4">
          <div>
            <p className="text-sm font-semibold text-ink">Coup de feu au fournil ?</p>
            <p className="text-xs text-stone-warm">
              Décale les créneaux clients de 30 minutes, le temps de souffler. Tout redémarre tout seul.
            </p>
            {erreurPause && <p className="mt-1 text-xs text-rose-600">{erreurPause}</p>}
          </div>
          <button
            type="button"
            onClick={togglePause}
            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-amber-600"
          >
            <Clock size={15} /> Pause 30 min
          </button>
        </section>
      )}

      {/* 5. Fermeture exceptionnelle — tout en bas, avec confirmation
             pour éviter une fermeture accidentelle. */}
      {!boutiqueFermee && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sand bg-paper p-4">
          <div>
            <p className="text-sm font-semibold text-ink">Fermeture exceptionnelle</p>
            <p className="text-xs text-stone-warm">
              Congés, jour férié, imprévu : suspend les commandes en ligne côté client.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Fermer la boutique aujourd’hui ?\nLes clients ne pourront plus commander en ligne jusqu’à la réouverture.')) {
                basculerFermeture()
              }
            }}
            className="rounded-lg px-4 py-2.5 text-sm font-bold text-rose-600 ring-1 ring-rose-300 transition-colors hover:bg-rose-50"
          >
            Fermer la boutique aujourd'hui
          </button>
        </section>
      )}
    </div>
  )
}

// --- Carte commande ---
// Le statut se choisit avec 3 gros boutons : À préparer / Prête / Livrée.
// On tape sur celui qu'on veut — et on peut revenir en arrière si on s'est trompé.
function CarteCommande({ commande, onStatut }) {
  const livree = commande.statut === 'livree'
  const { rembourserCommande } = useShop()
  const [remboursement, setRemboursement] = useState('') // '' | 'encours' | message d'erreur

  async function rembourser() {
    const ok = window.confirm(
      `Rembourser ${formatPrix(commande.total)} à ${commande.client || 'ce client'} ?\n` +
        `L'argent repartira sur sa carte (2 à 5 jours). Cette action est définitive.`,
    )
    if (!ok) return
    setRemboursement('encours')
    try {
      await rembourserCommande(commande.id)
      setRemboursement('')
    } catch (e) {
      setRemboursement('Remboursement impossible : ' + (e?.message || e))
    }
  }

  return (
    <div className={`flex flex-col rounded-xl border border-sand bg-paper p-4 ${livree ? 'opacity-75' : ''}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <span className="font-display text-lg text-ink">#{commande.numero}</span>
          {commande.client && (
            <span className="text-sm font-semibold text-crust">pour {commande.client}</span>
          )}
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

      {/* Téléphone du client (appel direct) */}
      {commande.telephone && (
        <a
          href={`tel:${commande.telephone.replace(/\s/g, '')}`}
          className="mt-1.5 inline-flex w-fit items-center gap-1 text-xs font-medium text-stone-warm hover:text-crust"
        >
          <Phone size={12} /> {commande.telephone}
        </a>
      )}

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

        {/* Remboursement : badge si déjà fait, sinon petit lien discret */}
        {commande.remboursee ? (
          <p className="mt-2.5">
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 ring-1 ring-rose-200">
              Remboursée
            </span>
          </p>
        ) : commande.stripeSession ? (
          <button
            type="button"
            onClick={rembourser}
            disabled={remboursement === 'encours'}
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-medium text-stone-warm transition-colors hover:text-rose-600 disabled:opacity-50"
          >
            <Undo2 size={12} />
            {remboursement === 'encours' ? 'Remboursement en cours…' : 'Rembourser le client'}
          </button>
        ) : null}
        {remboursement && remboursement !== 'encours' && (
          <p className="mt-1 text-xs text-rose-600">{remboursement}</p>
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

  async function traiter(valeur) {
    const r = await validerRetrait(valeur)
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
              <CheckCircle2 size={18} /> Commande #{resultat.commande.numero}
              {resultat.commande.client ? ` de ${resultat.commande.client}` : ''} remise au client
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

// --- Mes produits : TOUT au même endroit, rangé par catégorie ---
// Chaque catégorie montre ses produits (stock, épuisé, modifier, supprimer),
// un bouton pour ajouter un produit directement dedans, et ses sous-catégories.
function GestionProduits({
  produits,
  categories,
  ajusterStock,
  marquerEpuise,
  remettreEnStock,
  ajouterProduit,
  mettreAJourProduit,
  supprimerProduit,
  ajouterCategorie,
  supprimerCategorie,
  ajouterSousCategorie,
  supprimerSousCategorie,
}) {
  const [formCategorie, setFormCategorie] = useState(false)
  // Produits dont la catégorie a été supprimée : on les garde visibles
  const orphelins = produits.filter((p) => !categories.some((c) => c.id === p.categorie))

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm text-stone-warm">
          {produits.length} produit{produits.length > 1 ? 's' : ''} ·{' '}
          {categories.length} catégorie{categories.length > 1 ? 's' : ''}
        </p>
        <button
          type="button"
          onClick={() => setFormCategorie((o) => !o)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-crust px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-crust-dark"
        >
          {formCategorie ? <X size={16} /> : <PlusCircle size={16} />}
          {formCategorie ? 'Fermer' : 'Nouvelle catégorie'}
        </button>
      </div>

      {formCategorie && (
        <CategorieForm
          onAjouter={(data) => {
            ajouterCategorie(data)
            setFormCategorie(false)
          }}
        />
      )}

      <div className="space-y-5">
        {categories.map((c) => (
          <SectionCategorie
            key={c.id}
            categorie={c}
            produitsCategorie={produits.filter((p) => p.categorie === c.id)}
            ajusterStock={ajusterStock}
            marquerEpuise={marquerEpuise}
            remettreEnStock={remettreEnStock}
            ajouterProduit={ajouterProduit}
            mettreAJourProduit={mettreAJourProduit}
            supprimerProduit={supprimerProduit}
            onSupprimerCategorie={() => {
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

        {/* Produits sans catégorie (après suppression d'une catégorie) */}
        {orphelins.length > 0 && (
          <section className="overflow-hidden rounded-xl border border-sand bg-paper">
            <p className="border-b border-sand-soft p-4 font-display text-lg text-ink">
              Sans catégorie
            </p>
            <div className="space-y-3 p-4">
              {orphelins.map((p) => (
                <LigneProduit
                  key={p.id}
                  produit={p}
                  onMoins={() => ajusterStock(p.id, -1)}
                  onPlus={() => ajusterStock(p.id, 1)}
                  onEpuise={() => marquerEpuise(p.id)}
                  onRemettre={() => remettreEnStock(p.id)}
                  onSupprimer={() => {
                    if (window.confirm(`Supprimer « ${p.nom} » ? Cette action est définitive.`)) {
                      supprimerProduit(p.id)
                    }
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

// Une catégorie et ses produits : en-tête illustré, lignes produit,
// ajout direct dans la catégorie, sous-catégories repliées en bas.
function SectionCategorie({
  categorie,
  produitsCategorie,
  ajusterStock,
  marquerEpuise,
  remettreEnStock,
  ajouterProduit,
  mettreAJourProduit,
  supprimerProduit,
  onSupprimerCategorie,
  onAjouterSous,
  onSupprimerSous,
}) {
  // edition : null (fermé) | 'nouveau' | l'objet produit à modifier
  const [edition, setEdition] = useState(null)
  const [nouvelleSous, setNouvelleSous] = useState('')

  function valider(data) {
    if (edition === 'nouveau') ajouterProduit(data)
    else mettreAJourProduit(edition.id, data)
    setEdition(null)
  }

  function ajouterSous(e) {
    e.preventDefault()
    if (!nouvelleSous.trim()) return
    onAjouterSous(nouvelleSous)
    setNouvelleSous('')
  }

  return (
    <section className="overflow-hidden rounded-xl border border-sand bg-paper">
      {/* En-tête : illustration + nom + suppression de la catégorie */}
      <div className="flex items-center gap-3 border-b border-sand-soft p-4">
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white text-2xl text-white ring-1 ring-sand"
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
          onClick={onSupprimerCategorie}
          aria-label={`Supprimer ${categorie.nom}`}
          title="Supprimer la catégorie"
          className="shrink-0 text-stone-warm transition-colors hover:text-rose-600"
        >
          <Trash2 size={17} />
        </button>
      </div>

      {/* Les produits de la catégorie */}
      <div className="space-y-3 p-4">
        {produitsCategorie.map((p) => (
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

        {/* Ajouter un produit directement dans CETTE catégorie */}
        <button
          type="button"
          onClick={() => setEdition(edition === 'nouveau' ? null : 'nouveau')}
          className={`flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed py-3 text-sm font-semibold transition-colors ${
            edition === 'nouveau'
              ? 'border-crust text-crust'
              : 'border-sand text-stone-warm hover:border-crust/50 hover:text-crust'
          }`}
        >
          {edition === 'nouveau' ? <X size={16} /> : <PlusCircle size={16} />}
          {edition === 'nouveau' ? 'Fermer' : `Ajouter un produit dans « ${categorie.nom} »`}
        </button>

        {/* Formulaire : nouveau produit (pré-rempli sur la catégorie) ou modification */}
        {edition && (
          <ProductForm
            key={edition === 'nouveau' ? 'nouveau' : edition.id}
            produit={edition === 'nouveau' ? null : edition}
            categorieParDefaut={categorie.id}
            onValider={valider}
            onAnnuler={() => setEdition(null)}
          />
        )}
      </div>

      {/* Sous-catégories, repliées pour ne pas surcharger */}
      <details className="border-t border-sand-soft">
        <summary className="cursor-pointer list-none px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-warm [&::-webkit-details-marker]:hidden">
          Sous-catégories ({categorie.sousCategories.length}) — toucher pour gérer
        </summary>
        <div className="px-4 pb-4">
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
      </details>
    </section>
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
  // On édite la valeur BRUTE de l'image (clé ou photo téléversée), pas l'URL résolue.
  const [image, setImage] = useState(produit?.imageRef ?? '')
  const apercuImage = resolveImage(image)
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
              style={apercuImage ? undefined : { background: `linear-gradient(150deg, ${categories.find((c) => c.id === categorie)?.from}, ${categories.find((c) => c.id === categorie)?.to})` }}
            >
              {apercuImage ? (
                <img src={apercuImage} alt="" className="h-full w-full object-cover" />
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

      {/* Étiquette choisie par le boulanger.
          (Le badge "Nouveau" est automatique : 3 jours après la mise en ligne.) */}
      <div className="mt-4 flex flex-wrap gap-4">
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

// --- Ligne produit (disponibilité + modification + suppression) ---
// Détecte un produit vendu en lot d'après son nom "(×N)" -> { n, mot }.
// Pétrie = plaque, chouquettes = sachet.
function lotDe(nom) {
  const m = /\(×(\d+)\)/.exec(nom || '')
  if (!m) return null
  return { n: Number(m[1]), mot: /chouquette/i.test(nom) ? 'sachet' : 'plaque' }
}

function LigneProduit({ produit, onMoins, onPlus, onEpuise, onRemettre, onModifier, onSupprimer }) {
  const epuise = !produit.disponible
  const lot = lotDe(produit.nom)
  const uniteStock = lot ? ` ${lot.mot}${produit.stock > 1 ? 's' : ''} de ${lot.n}` : ''

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
            <CheckCircle2 size={13} /> En stock : {produit.stock}{uniteStock}
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
