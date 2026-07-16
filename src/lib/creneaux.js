// ============================================================
//  Calcul des créneaux de retrait
//  -----------------------------------------------------------
//  - Le client peut choisir SON JOUR : aujourd'hui ou l'un des
//    jours d'ouverture suivants (précommande).
//  - Un créneau devient "Complet" quand trop de commandes sont
//    déjà prévues sur le même quart d'heure (on protège le fournil).
// ============================================================

import { bakery, estJourFerme } from '../data/bakery'

// Au-delà de N commandes sur le même quart d'heure : créneau complet
export const MAX_COMMANDES_PAR_CRENEAU = 4

// Affiche une date en "HH:MM"
export function formatHeure(date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

// Lit les horaires d'un jour donné : { ouverture, fermeture } ou null si "Fermé"
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

// Ramène une date au quart d'heure inférieur (clé de comptage)
function quartDHeure(date) {
  const d = new Date(date)
  d.setSeconds(0, 0)
  d.setMinutes(Math.floor(d.getMinutes() / 15) * 15)
  return d.getTime()
}

// Compte les commandes en cours par quart d'heure de retrait
function chargeParQuart(commandes) {
  const charge = new Map()
  commandes.forEach((c) => {
    if (c.statut === 'livree' || !c.heureRetrait) return
    const d = new Date(c.heureRetrait)
    if (Number.isNaN(d.getTime())) return
    const cle = quartDHeure(d)
    charge.set(cle, (charge.get(cle) || 0) + 1)
  })
  return charge
}

function estComplet(date, charge) {
  return (charge.get(quartDHeure(date)) || 0) >= MAX_COMMANDES_PAR_CRENEAU
}

// "" aujourd'hui, "demain", sinon "lundi 14/7" — utilisé dans la commande
function labelJour(date) {
  const j0 = new Date()
  j0.setHours(0, 0, 0, 0)
  const j = new Date(date)
  j.setHours(0, 0, 0, 0)
  const ecart = Math.round((j - j0) / 86400000)
  if (ecart <= 0) return ''
  if (ecart === 1) return 'demain'
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'numeric' })
}

// Les créneaux d'un jour donné (liste vide si fermé / plus de place)
function creneauxPourJour(date, delaiPrepMin, charge) {
  if (estJourFerme(date)) return []
  const horaires = horairesDuJour(date)
  if (!horaires) return []

  const maintenant = new Date()
  const memeJour = date.toDateString() === maintenant.toDateString()

  const ouverture = new Date(date)
  ouverture.setHours(horaires.ouverture.h, horaires.ouverture.m, 0, 0)
  const fermeture = new Date(date)
  fermeture.setHours(horaires.fermeture.h, horaires.fermeture.m, 0, 0)

  // Prêt au plus tôt : maintenant (si aujourd'hui) ou l'ouverture, + préparation
  const base = memeJour ? new Date(Math.max(maintenant.getTime(), ouverture.getTime())) : ouverture
  const auPlusTot = arrondir5min(new Date(base.getTime() + delaiPrepMin * 60000))
  const jourLabel = labelJour(date)

  const creneaux = []
  // "Dès que possible" seulement pour aujourd'hui, si pas déjà complet
  if (memeJour && auPlusTot <= fermeture && !estComplet(auPlusTot, charge)) {
    creneaux.push({
      id: 'asap',
      label: 'Dès que possible',
      detail: `vers ${formatHeure(auPlusTot)}`,
      date: auPlusTot,
      complet: false,
      jourLabel,
    })
  }

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
      complet: estComplet(d, charge),
      jourLabel,
    })
  }
  return creneaux
}

// Les jours proposables (aujourd'hui + 6 suivants), seulement ceux qui
// ont au moins un créneau. Chaque jour embarque déjà ses créneaux.
export function joursDisponibles(delaiPrepMin = 15, commandes = []) {
  const charge = chargeParQuart(commandes)
  const jours = []
  for (let j = 0; j <= 6; j++) {
    const date = new Date()
    date.setDate(date.getDate() + j)
    const creneaux = creneauxPourJour(date, delaiPrepMin, charge)
    if (creneaux.length === 0) continue
    const libelle =
      j === 0
        ? "Aujourd'hui"
        : j === 1
          ? 'Demain'
          : date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'numeric' })
    jours.push({ offset: j, libelle, creneaux })
  }
  return jours
}

// Compatibilité : les créneaux du premier jour disponible
export function genererCreneaux(delaiPrepMin = 15, commandes = []) {
  const jours = joursDisponibles(delaiPrepMin, commandes)
  return jours.length > 0 ? jours[0].creneaux : []
}
