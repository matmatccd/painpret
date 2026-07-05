// Formate un prix en euros à la française : 1.3 -> "1,30 €"
export function formatPrix(valeur) {
  return valeur.toFixed(2).replace('.', ',') + ' €'
}
