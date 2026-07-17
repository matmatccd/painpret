import { useState, useEffect, useRef } from 'react'
import { Ban } from 'lucide-react'
import Header from './components/Header'
import Hero from './components/Hero'
import CategoryView from './components/CategoryView'
import ProductRow from './components/ProductRow'
import ProductCard from './components/ProductCard'
import FicheProduit from './components/FicheProduit'
import CartDrawer from './components/CartDrawer'
import PickupSlots from './components/PickupSlots'
import Confirmation from './components/Confirmation'
import Historique from './components/Historique'
import Faq from './components/Faq'
import CommentCaMarche from './components/CommentCaMarche'
import AvisClients from './components/AvisClients'
import Bandeau from './components/Bandeau'
import Reveal from './components/Reveal'
import Footer from './components/Footer'
import MerchantLogin from './components/MerchantLogin'
import MerchantDashboard from './components/MerchantDashboard'
import Toaster from './components/Toaster'
import HomeSkeleton from './components/Skeleton'
import MobileCartBar from './components/MobileCartBar'
import { useShop } from './context/ShopContext'
import { useNotifications } from './context/NotificationsContext'
import { supabase, modeReel } from './lib/supabase'
import { lireSessionPaiement } from './lib/stripe'

// Message de notification selon le nouveau statut d'une commande
function messagePourStatut(statut, numero) {
  switch (statut) {
    case 'prete':
      return `Votre commande #${numero} est prête ! Présentez votre QR Code en boutique.`
    case 'livree':
      return `Commande #${numero} récupérée. Merci et à bientôt chez La Pétrie !`
    default:
      return null
  }
}

export default function App() {
  const { produits, commandes, categories, boutiqueFermee } = useShop()
  const { ajouterNotification } = useNotifications()

  // 'client' | 'login' (code pro) | 'boulanger'
  // La plateforme boulanger a sa propre "adresse" : le site + #pro.
  // Si le boulanger s'est déjà connecté sur cet appareil, il entre directement.
  const [mode, setMode] = useState(() => {
    if (window.location.hash === '#pro') {
      // Mode réel : la session Supabase décide (vérifiée juste après) -> 'login' par défaut
      if (modeReel) return 'login'
      return localStorage.getItem('painpret_pro') === '1' ? 'boulanger' : 'login'
    }
    return 'client'
  })

  // Mode réel : si le boulanger a déjà une session ouverte, on entre directement
  useEffect(() => {
    if (!modeReel) return
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && window.location.hash === '#pro') setMode('boulanger')
    })
  }, [])

  // Ouvre l'espace pro (depuis l'en-tête ou le pied de page)
  function ouvrirEspacePro() {
    window.location.hash = 'pro'
    if (modeReel) {
      supabase.auth.getSession().then(({ data }) => setMode(data.session ? 'boulanger' : 'login'))
    } else {
      setMode(localStorage.getItem('painpret_pro') === '1' ? 'boulanger' : 'login')
    }
  }

  // Connexion réussie (compte réel ou code démo)
  function connexionPro() {
    if (!modeReel) localStorage.setItem('painpret_pro', '1')
    window.location.hash = 'pro'
    setMode('boulanger')
  }

  // Retour au site client (reste connecté)
  function retourSiteClient() {
    history.replaceState(null, '', window.location.pathname)
    setMode('client')
  }

  // Déconnexion de l'espace pro
  async function deconnexionPro() {
    if (modeReel) await supabase.auth.signOut()
    else localStorage.removeItem('painpret_pro')
    history.replaceState(null, '', window.location.pathname)
    setMode('client')
  }

  // Vue côté client : 'boutique' | 'checkout' | 'confirmation'
  const [vue, setVue] = useState('boutique')
  const [commandeConfirmee, setCommandeConfirmee] = useState(null)

  const [recherche, setRecherche] = useState('')
  const [produitOuvertId, setProduitOuvertId] = useState(null)
  const [categorieActive, setCategorieActive] = useState(null)
  const [panierOuvert, setPanierOuvert] = useState(false)

  // Court chargement simulé au démarrage (affiche le squelette).
  // Prêt pour un vrai chargement de données plus tard (Supabase).
  const [chargement, setChargement] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => setChargement(false), 700)
    return () => clearTimeout(t)
  }, [])

  // --- Favoris du client (mémorisés sur l'appareil) ---
  const [favoris, setFavoris] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('painpret_favoris')) || []
    } catch {
      return []
    }
  })
  function toggleFavori(id) {
    setFavoris((actuels) => {
      const suivants = actuels.includes(id)
        ? actuels.filter((x) => x !== id)
        : [...actuels, id]
      localStorage.setItem('painpret_favoris', JSON.stringify(suivants))
      return suivants
    })
  }

  // --- Historique des commandes du client (mémorisé sur l'appareil) ---
  const [historique, setHistorique] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('painpret_historique')) || []
    } catch {
      return []
    }
  })
  function ajouterAHistorique(commande) {
    setHistorique((actuel) => {
      const entree = {
        id: commande.id,
        numero: commande.numero,
        date: Date.now(),
        creneau: commande.creneau,
        articles: commande.articles,
        total: commande.total,
      }
      const suivant = [entree, ...actuel].slice(0, 20) // on garde les 20 dernières
      localStorage.setItem('painpret_historique', JSON.stringify(suivant))
      return suivant
    })
  }

  // Les commandes passées par CE client (pour le suivre et le notifier)
  const [mesCommandesIds, setMesCommandesIds] = useState([])
  // Mémoire du dernier statut connu de chaque commande suivie
  const statutsPrecedents = useRef({})

  // Surveille les changements de statut des commandes du client -> notifications
  useEffect(() => {
    commandes.forEach((c) => {
      if (!mesCommandesIds.includes(c.id)) return
      const ancien = statutsPrecedents.current[c.id]
      if (ancien && ancien !== c.statut) {
        const msg = messagePourStatut(c.statut, c.numero)
        if (msg) ajouterNotification(msg)
      }
      statutsPrecedents.current[c.id] = c.statut
    })
  }, [commandes, mesCommandesIds, ajouterNotification])

  // Session Stripe à confirmer (au retour d'un paiement réussi)
  const [sidPaiement, setSidPaiement] = useState(() => lireSessionPaiement())

  // Retour de la page de paiement Stripe (au chargement de l'appli)
  useEffect(() => {
    const h = window.location.hash
    if (h.includes('paiement-reussi')) {
      history.replaceState(null, '', window.location.pathname)
      setVue('paiement') // écran d'attente pendant que le webhook crée la commande
    } else if (h.includes('paiement-annule')) {
      history.replaceState(null, '', window.location.pathname)
      ajouterNotification('Paiement annulé. Vous pouvez recommander quand vous voulez.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Dès que la commande payée arrive (créée par le webhook, via temps réel) :
  // on affiche la confirmation.
  useEffect(() => {
    if (!sidPaiement) return
    const commande = commandes.find((c) => c.stripeSession === sidPaiement)
    if (commande) {
      setSidPaiement(null)
      setMesCommandesIds((ids) => (ids.includes(commande.id) ? ids : [...ids, commande.id]))
      statutsPrecedents.current[commande.id] = commande.statut
      ajouterAHistorique(commande)
      setCommandeConfirmee(commande)
      setVue('confirmation')
      window.scrollTo({ top: 0 })
      ajouterNotification(`Paiement reçu ! Votre commande #${commande.numero} est en préparation.`)
    }
  }, [commandes, sidPaiement])

  // Filet de sécurité : si la commande n'arrive pas en ~30 s, on n'attend plus
  useEffect(() => {
    if (!sidPaiement) return
    const t = setTimeout(() => {
      setSidPaiement(null)
      setVue('historique')
      ajouterNotification('Paiement reçu ! Votre commande apparaîtra dans « Mes commandes » dans un instant.')
    }, 30000)
    return () => clearTimeout(t)
  }, [sidPaiement])

  const produitOuvert = produits.find((p) => p.id === produitOuvertId) ?? null
  // Trois groupes clairs pour l'accueil : Pains, Pains spéciaux et Boissons
  const produitsPains = produits.filter((p) => p.categorie === 'pains')
  const produitsSpeciaux = produits.filter((p) => p.categorie === 'pains-speciaux')
  const produitsViennoiseries = produits.filter((p) => p.categorie === 'viennoiseries')
  const produitsGourmandises = produits.filter((p) => p.categorie === 'gourmandises')
  const produitsBoissons = produits.filter((p) => p.categorie === 'boissons')
  const produitsFavoris = produits.filter((p) => favoris.includes(p.id))

  function ouvrirProduit(produit) {
    setProduitOuvertId(produit.id)
    window.scrollTo({ top: 0 })
  }

  function retourBoutique() {
    setVue('boutique')
    setProduitOuvertId(null)
    setCategorieActive(null)
    setCommandeConfirmee(null)
    window.scrollTo({ top: 0 })
  }

  function ouvrirCategorie(id) {
    setCategorieActive(id)
    setProduitOuvertId(null)
    window.scrollTo({ top: 0 })
  }

  function ouvrirCheckout() {
    setPanierOuvert(false)
    setProduitOuvertId(null)
    setVue('checkout')
    window.scrollTo({ top: 0 })
  }

  // Recherche tolérante : sans tenir compte des accents ni des majuscules,
  // dans le nom mais aussi la description et la catégorie du produit.
  const normaliser = (t) =>
    (t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const termeRecherche = normaliser(recherche.trim())
  const resultats = termeRecherche
    ? produits.filter((p) =>
        normaliser(`${p.nom} ${p.description} ${p.sousCategorie} ${p.categorie}`).includes(
          termeRecherche,
        ),
      )
    : []

  // --- Accès pro : code (mémorisé ensuite sur l'appareil) ---
  if (mode === 'login') {
    return <MerchantLogin onSucces={connexionPro} onRetour={retourSiteClient} />
  }

  // --- Espace boulanger (une fois connecté) ---
  if (mode === 'boulanger') {
    return (
      <MerchantDashboard onRetourClient={retourSiteClient} onDeconnexion={deconnexionPro} />
    )
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        recherche={recherche}
        setRecherche={(v) => {
          setRecherche(v)
          setProduitOuvertId(null)
          setCategorieActive(null)
          setVue('boutique')
        }}
        onAccueil={() => {
          retourBoutique()
          setRecherche('')
        }}
        onOuvrirPanier={() => setPanierOuvert(true)}
        onEspacePro={ouvrirEspacePro}
        onHistorique={() => {
          setProduitOuvertId(null)
          setVue('historique')
          window.scrollTo({ top: 0 })
        }}
      />

      {/* Fermeture exceptionnelle décidée par le boulanger */}
      {boutiqueFermee && (
        <div className="flex items-center justify-center gap-2 bg-rose-600 px-4 py-2.5 text-center text-sm font-semibold text-white">
          <Ban size={15} className="shrink-0" />
          La boutique est exceptionnellement fermée — les commandes en ligne sont suspendues.
        </div>
      )}

      <main className="flex-1">
        {vue === 'paiement' ? (
          <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-sand border-t-crust" />
            <h1 className="mt-6 text-2xl text-ink">Paiement reçu !</h1>
            <p className="mt-2 text-sm text-stone-warm">
              On enregistre votre commande… un instant.
            </p>
            <button
              type="button"
              onClick={retourBoutique}
              className="mt-6 text-sm font-semibold text-crust hover:underline"
            >
              Retour à la boutique
            </button>
          </div>
        ) : vue === 'confirmation' && commandeConfirmee ? (
          <Confirmation commande={commandeConfirmee} onTermine={retourBoutique} />
        ) : vue === 'faq' ? (
          <Faq onRetour={retourBoutique} />
        ) : vue === 'historique' ? (
          <Historique
            historique={historique}
            onRetour={retourBoutique}
            onPanierRempli={() => {
              retourBoutique()
              setPanierOuvert(true)
            }}
            onVoirQR={(commande) => {
              setCommandeConfirmee(commande)
              setVue('confirmation')
              window.scrollTo({ top: 0 })
            }}
          />
        ) : vue === 'checkout' ? (
          <PickupSlots
            onRetour={retourBoutique}
            onConfirme={(commande) => {
              setMesCommandesIds((ids) => [...ids, commande.id])
              statutsPrecedents.current[commande.id] = commande.statut
              ajouterAHistorique(commande)
              setCommandeConfirmee(commande)
              setVue('confirmation')
              window.scrollTo({ top: 0 })
              // Notification client : la commande part en préparation
              ajouterNotification(`Votre commande #${commande.numero} est en préparation. On vous prévient dès qu'elle est prête !`)
            }}
          />
        ) : produitOuvert ? (
          <FicheProduit
            produit={produitOuvert}
            onRetour={() => setProduitOuvertId(null)}
            onAjoutReussi={() => setPanierOuvert(true)}
            suggestions={produits
              .filter((p) => p.id !== produitOuvert.id && p.categorie === produitOuvert.categorie && p.disponible)
              .slice(0, 3)}
            onOpen={ouvrirProduit}
          />
        ) : termeRecherche ? (
          <section className="mx-auto w-full max-w-6xl px-4 py-8">
            <h2 className="mb-6 text-2xl text-ink sm:text-3xl">
              {resultats.length > 0
                ? `${resultats.length} résultat${resultats.length > 1 ? 's' : ''} pour « ${recherche} »`
                : `Aucun résultat pour « ${recherche} »`}
            </h2>
            {resultats.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {resultats.map((produit, i) => (
                  <ProductCard
                    key={produit.id}
                    produit={produit}
                    onOpen={ouvrirProduit}
                    index={i}
                    favori={favoris.includes(produit.id)}
                    onToggleFavori={toggleFavori}
                  />
                ))}
              </div>
            ) : (
              <p className="text-stone-warm">
                Essayez un autre mot, par exemple « baguette » ou « croissant ».
              </p>
            )}
          </section>
        ) : categorieActive ? (
          <CategoryView
            categorie={categories.find((c) => c.id === categorieActive)}
            produits={produits.filter((p) => p.categorie === categorieActive)}
            onRetour={() => setCategorieActive(null)}
            onOpen={ouvrirProduit}
          />
        ) : chargement ? (
          <HomeSkeleton />
        ) : (
          <>
            <Hero />
            <Bandeau />
            {produitsFavoris.length > 0 && (
              <ProductRow surtitre="Vos préférés" titre="Mes favoris" produits={produitsFavoris} onOpen={ouvrirProduit} favoris={favoris} onToggleFavori={toggleFavori} />
            )}
            <ProductRow surtitre="La gamme Pétrisane" titre="Baguettes" produits={produitsPains} onOpen={ouvrirProduit} favoris={favoris} onToggleFavori={toggleFavori} />
            <Reveal>
              <ProductRow surtitre="Le fournil" titre="Pains spéciaux" produits={produitsSpeciaux} onOpen={ouvrirProduit} favoris={favoris} onToggleFavori={toggleFavori} />
            </Reveal>
            {produitsViennoiseries.length > 0 && (
              <Reveal>
                <ProductRow surtitre="Tout juste sorties du four" titre="Viennoiseries" produits={produitsViennoiseries} onOpen={ouvrirProduit} favoris={favoris} onToggleFavori={toggleFavori} />
              </Reveal>
            )}
            {produitsGourmandises.length > 0 && (
              <Reveal>
                <ProductRow surtitre="À partager" titre="Gourmandises" produits={produitsGourmandises} onOpen={ouvrirProduit} favoris={favoris} onToggleFavori={toggleFavori} />
              </Reveal>
            )}
            {produitsBoissons.length > 0 && (
              <Reveal>
                <ProductRow surtitre="Fraîcheur" titre="Boissons" produits={produitsBoissons} onOpen={ouvrirProduit} favoris={favoris} onToggleFavori={toggleFavori} />
              </Reveal>
            )}
            <Reveal>
              <AvisClients />
            </Reveal>
            <CommentCaMarche onFAQ={() => { setVue('faq'); window.scrollTo({ top: 0 }) }} />
          </>
        )}
      </main>

      <Footer onFAQ={() => { setVue('faq'); setProduitOuvertId(null); window.scrollTo({ top: 0 }) }} />

      {/* Espace en bas pour ne pas masquer le contenu derrière la barre mobile */}
      {vue !== 'checkout' && vue !== 'confirmation' && <div className="h-20 sm:hidden" />}

      <CartDrawer
        ouvert={panierOuvert}
        onFermer={() => setPanierOuvert(false)}
        onCheckout={ouvrirCheckout}
      />

      {/* Barre panier flottante (mobile uniquement) */}
      {vue !== 'checkout' && vue !== 'confirmation' && (
        <MobileCartBar onOuvrir={() => setPanierOuvert(true)} />
      )}

      {/* Bulles de notification (côté client) */}
      <Toaster />
    </div>
  )
}
