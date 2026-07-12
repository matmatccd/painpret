import { supabase, modeReel } from './supabase'

// Demande une page de paiement Stripe pour le panier, et renvoie son URL.
// (Le vrai calcul + la clé secrète restent côté serveur, dans la fonction.)
export async function creerPaiement(articles, email) {
  if (!modeReel) throw new Error('paiement indisponible')
  const { data, error } = await supabase.functions.invoke('creer-paiement', {
    body: { articles, email, base_url: window.location.href.replace(/#.*$/, '') },
  })
  if (error) throw new Error(error.message)
  if (data?.erreur) throw new Error(data.erreur)
  if (!data?.url) throw new Error('réponse de paiement invalide')
  return data.url
}

// Mémorise la commande en attente de paiement (on la crée au retour de Stripe)
export function memoriserPaiementEnCours(donnees) {
  localStorage.setItem('painpret_paiement', JSON.stringify(donnees))
}
export function lirePaiementEnCours() {
  try {
    const brut = localStorage.getItem('painpret_paiement')
    return brut ? JSON.parse(brut) : null
  } catch {
    return null
  }
}
export function effacerPaiementEnCours() {
  localStorage.removeItem('painpret_paiement')
}
