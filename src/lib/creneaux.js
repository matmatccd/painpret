// ============================================================
//  Calcul des créneaux de retrait (mode Drive)
//  -----------------------------------------------------------
//  On propose une heure "dès que possible" (maintenant + temps de
//  préparation) puis des créneaux réguliers tous les quarts d'heure,
//  jusqu'à la fermeture. Quelques créneaux peuvent être "complets".
// ============================================================

const HEURE_FERMETURE = 20 // 20:00

// Affiche une date en "HH:MM"
export function formatHeure(date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
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

  // Heure "prête au plus tôt" = maintenant + délai de préparation
  const auPlusTot = arrondir5min(new Date(maintenant.getTime() + delaiPrepMin * 60000))

  const creneaux = [
    {
      id: 'asap',
      label: 'Dès que possible',
      detail: `vers ${formatHeure(auPlusTot)}`,
      date: auPlusTot,
      complet: false,
    },
  ]

  // Premier créneau "rond" : prochain quart d'heure après l'heure au plus tôt
  const premier = new Date(auPlusTot)
  premier.setMinutes(Math.ceil(premier.getMinutes() / 15) * 15, 0, 0)

  // On propose 8 créneaux de 15 min, sans dépasser la fermeture
  for (let i = 0; i < 8; i++) {
    const d = new Date(premier.getTime() + i * 15 * 60000)
    if (d.getHours() >= HEURE_FERMETURE) break
    creneaux.push({
      id: formatHeure(d),
      label: formatHeure(d),
      detail: null,
      date: d,
      // Simulation : on marque le 3e créneau comme "complet" pour l'exemple
      complet: i === 2,
    })
  }

  return creneaux
}
