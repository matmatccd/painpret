// Gestion du mode clair / sombre.
// Le choix est mémorisé dans le navigateur ; si l'utilisateur n'a jamais
// choisi, on suit le réglage de son téléphone (clair ou sombre).

const CLE = 'painpret-theme'

// Ce que le téléphone/ordinateur préfère par défaut
function preferenceSysteme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'sombre' : 'clair'
}

// Le thème actuellement choisi (ou celui du système si aucun choix enregistré)
export function themeActuel() {
  try {
    const enregistre = localStorage.getItem(CLE)
    if (enregistre === 'clair' || enregistre === 'sombre') return enregistre
  } catch {
    // navigation privée : localStorage peut être bloqué, on ignore
  }
  return preferenceSysteme()
}

// Applique le thème à la page (et à la couleur de la barre du navigateur)
export function appliquerTheme(theme) {
  const racine = document.documentElement
  if (theme === 'sombre') racine.setAttribute('data-theme', 'sombre')
  else racine.removeAttribute('data-theme')

  // La barre d'adresse du téléphone prend la couleur du bandeau
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'sombre' ? '#2a1220' : '#6b2a4e')
}

// Change de mode, mémorise le choix, et fait un fondu doux
export function basculerTheme() {
  const suivant = themeActuel() === 'sombre' ? 'clair' : 'sombre'
  try {
    localStorage.setItem(CLE, suivant)
  } catch {
    // ignoré : le mode marchera quand même, il ne sera juste pas mémorisé
  }

  // On n'active la transition que le temps du changement, pour ne pas
  // ralentir le reste du site.
  const racine = document.documentElement
  racine.classList.add('transition-theme')
  appliquerTheme(suivant)
  setTimeout(() => racine.classList.remove('transition-theme'), 320)

  return suivant
}
