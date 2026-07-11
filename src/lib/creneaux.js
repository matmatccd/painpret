// ============================================================
//  Calcul des créneaux de retrait
//  -----------------------------------------------------------
//  On propose une heure "dès que possible" (maintenant + temps de
//  préparation) puis des créneaux réguliers tous les quarts d'heure,
//  jusqu'à la FERMETURE RÉELLE du jour (ex : 13h00 le dimanche).
// ============================================================

import { bakery, estJourFerme } from '../data/bakery'

// Affiche une date en "HH:MM"
export function formatHeure(date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// Lit l'heure de fermeture d'aujourd'hui dans les horaires de la boulangerie.
// Les horaires sont écrits "07:00 – 20:00" -> on récupère { h: 20, m: 0 }.
function fermetureDuJour() {
  const jourJS = new Date().getDay() // 0 = dimanche
  const ligne = bakery.horaires[jourJS === 0 ? 6 : jourJS - 1]
  const match = ligne?.heures.match(/(\d{1,2}):(\d{2})\s*$/)
  if (!match) return { h: 20, m: 0 } // valeur de secours
  return { h: parseInt(match[1]), m: parseInt(match[2]) }
}

// Arrondit une date aux 5 minutes supérieures
function arrondir5min(date) {
  const d = new Date(date)
  d.setSeconds(0, 0)
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5)
  return d
}

// Génère la liste des créneaux disponibles à partir d'un délai de prépa (minutes)
export function genererCreneaux(delaiPrepMin = 15) {
  const maintenant = new Date()

  // Jour de fermeture (vendredi / dernier jeudi du mois) : aucun créneau
  if (estJourFerme(maintenant)) return []

  // Heure limite du jour = la fermeture réelle de la boutique
  const { h, m } = fermetureDuJour()
  const fermeture = new Date(maintenant)
  fermeture.setHours(h, m, 0, 0)

  // Heure "prête au plus tôt" = maintenant + délai de préparation
  const auPlusTot = arrondir5min(new Date(maintenant.getTime() + delaiPrepMin * 60000))

  const creneaux = []

  // "Dès que possible" seulement si la boutique est encore ouverte à cette heure
  if (auPlusTot <= fermeture) {
    creneaux.push({
      id: 'asap',
      label: 'Dès que possible',
      detail: `vers ${formatHeure(auPlusTot)}`,
      date: auPlusTot,
      complet: false,
    })
  }

  // Premier créneau "rond" : prochain quart d'heure après l'heure au plus tôt
  const premier = new Date(auPlusTot)
  premier.setMinutes(Math.ceil(premier.getMinutes() / 15) * 15, 0, 0)

  // On propose jusqu'à 8 créneaux de 15 min, sans dépasser la fermeture
  for (let i = 0; i < 8; i++) {
    const d = new Date(premier.getTime() + i * 15 * 60000)
    if (d > fermeture) break
    creneaux.push({
      id: formatHeure(d),
      label: formatHeure(d),
      detail: null,
      date: d,
      complet: false,
    })
  }

  return creneaux
}
