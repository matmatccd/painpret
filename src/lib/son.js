// ============================================================
//  Petit carillon "nouvelle commande" (côté boulanger)
//  -----------------------------------------------------------
//  Généré avec le Web Audio API : pas besoin de fichier audio.
//  Deux notes douces (la -> ré), courtes et pas agressives.
//  Le son est un bonus : si le navigateur le bloque, on ignore.
// ============================================================

let contexteAudio = null

export function jouerCarillon() {
  try {
    contexteAudio = contexteAudio || new (window.AudioContext || window.webkitAudioContext)()
    if (contexteAudio.state === 'suspended') contexteAudio.resume()

    const depart = contexteAudio.currentTime
    const notes = [880, 1174.7] // La5 puis Ré6

    notes.forEach((frequence, i) => {
      const debut = depart + i * 0.14
      const oscillateur = contexteAudio.createOscillator()
      const volume = contexteAudio.createGain()

      oscillateur.type = 'sine'
      oscillateur.frequency.value = frequence

      volume.gain.setValueAtTime(0, debut)
      volume.gain.linearRampToValueAtTime(0.18, debut + 0.02)
      volume.gain.exponentialRampToValueAtTime(0.001, debut + 0.5)

      oscillateur.connect(volume)
      volume.connect(contexteAudio.destination)
      oscillateur.start(debut)
      oscillateur.stop(debut + 0.55)
    })
  } catch {
    // pas de son disponible : tant pis, le badge "Nouvelle" reste visible
  }
}
