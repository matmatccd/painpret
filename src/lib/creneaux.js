// ============================================================
//  Calcul des créneaux de retrait
//  -----------------------------------------------------------
//  AUJOURD'HUI si c'est encore possible : "dès que possible" puis
//  des créneaux tous les quarts d'heure jusqu'à la fermeture.
//  Sinon (boutique fermée, trop tard) : on propose le PROCHAIN jour
//  d'ouverture (demain, ou après si fermé) dès l'ouverture.
// ============================================================

import { bakery, estJourFerme } from '../data/bakery'

// Affiche une date en "HH:MM"
export function formatHeure(date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// Lit les horaires d'un jour donné : { ouverture: {h,m}, fermeture: {h,m} }
// ou null si la ligne est "Fermé".
function horairesDuJour(date) {
  const jourJS = date.getDay() // 0 = dimanche, notre tableau commence lundi
  const ligne = bakery.horaires[jourJS === 0 ? 6 : jourJS - 1]
  const debut = ligne?.heures.match(/^(\d{1,2}):(\d{2})/)
  const fin = ligne?.heures.match(/(\d{1,2}):(\d{2})\s*$/)
  if (!debut || !fin) return null
  return {
    ouverture: { h: parseInt(debut[1]), m: parseInt(debut[2]) },
    fermeture: { h: parseInt(fin[1]), m: parseInt(fin[2]) },
  }
}

// Arrondit une date aux 5 minutes supérieures
function arrondir5min(date) {
  const d = new Date(date)
  d.setSeconds(0, 0)
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5)
  return d
}

// Fabrique jusqu'à 8 créneaux de 15 min entre "auPlusTot" et "fermeture".
function creneauxEntre(auPlusTot, fermeture, jourLabel) {
  const creneaux = []
  const premier = new Date(auPlusTot)
  premier.setMinutes(Math.ceil(premier.getMinutes() / 15) * 15, 0, 0)
  for (let i = 0; i < 8; i++) {
    const d = new Date(premier.getTime() + i * 15 * 60000)
    if (d > fermeture) break
    creneaux.push({
      id: (jourLabel || 'auj') + '-' + formatHeure(d),
      label: formatHeure(d),
      detail: jourLabel || null,
      date: d,
      complet: false,
      jourLabel: jourLabel || '',
    })
  }
  return creneaux
}

// Génère la liste des créneaux disponibles à partir d'un délai de prépa (minutes)
export function genererCreneaux(delaiPrepMin = 15) {
  const maintenant = new Date()

  // ---- 1) Aujourd'hui, si la boutique est ouverte et qu'il reste du temps ----
  if (!estJourFerme(maintenant)) {
    const horaires = horairesDuJour(maintenant)
    if (horaires) {
      const fermeture = new Date(maintenant)
      fermeture.setHours(horaires.fermeture.h, horaires.fermeture.m, 0, 0)
      const auPlusTot = arrondir5min(new Date(maintenant.getTime() + delaiPrepMin * 60000))

      const creneaux = []
      if (auPlusTot <= fermeture) {
        creneaux.push({
          id: 'asap',
          label: 'Dès que possible',
          detail: `vers ${formatHeure(auPlusTot)}`,
          date: auPlusTot,
          complet: false,
          jourLabel: '',
        })
      }
      creneaux.push(...creneauxEntre(auPlusTot, fermeture, ''))
      if (creneaux.length > 0) return creneaux
    }
  }

  // ---- 2) Sinon : le prochain jour d'ouverture (jusqu'à 6 jours devant) ----
  for (let j = 1; j <= 6; j++) {
    const jour = new Date(maintenant)
    jour.setDate(jour.getDate() + j)
    jour.setHours(0, 0, 0, 0)
    if (estJourFerme(jour)) continue
    const horaires = horairesDuJour(jour)
    if (!horaires) continue

    const ouverture = new Date(jour)
    ouverture.setHours(horaires.ouverture.h, horaires.ouverture.m, 0, 0)
    const fermeture = new Date(jour)
    fermeture.setHours(horaires.fermeture.h, horaires.fermeture.m, 0, 0)
    // Prêt au plus tôt : l'ouverture + le temps de préparation
    const auPlusTot = arrondir5min(new Date(ouverture.getTime() + delaiPrepMin * 60000))

    const jourLabel =
      j === 1
        ? 'demain'
        : jour.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'numeric' })

    const creneaux = creneauxEntre(auPlusTot, fermeture, jourLabel)
    if (creneaux.length > 0) return creneaux
  }

  return []
}
