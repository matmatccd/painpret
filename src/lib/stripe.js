import { supabase, modeReel } from './supabase'

// Demande une page de paiement Stripe pour la commande, renvoie son URL.
// On envoie toute la commande : le serveur la garde "en attente" et la
// validera (via le webhook) une fois le paiement réussi.
export async function creerPaiement(commande) {
  if (!modeReel) throw new Error('paiement indisponible')
  const { data, error } = await supabase.functions.invoke('payement', {
    body: { ...commande, base_url: window.location.href.replace(/#.*$/, '') },
  })
  if (error) throw new Error(error.message)
  if (data?.erreur) throw new Error(data.erreur)
  if (!data?.url) throw new Error('réponse de paiement invalide')
  return data.url
}

// Lit l'identifiant de session Stripe dans l'adresse (#paiement-reussi?sid=...)
export function lireSessionPaiement(hash = window.location.hash) {
  const m = hash.match(/paiement-reussi\?sid=([^&]+)/)
  return m ? decodeURIComponent(m[1]) : null
}
