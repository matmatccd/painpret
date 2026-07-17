// ============================================================
//  "Vol au panier" : quand on ajoute un produit, sa photo
//  s'envole en courbe vers le bouton panier de l'en-tête,
//  qui rebondit à la réception. Pur plaisir, zéro incidence.
// ============================================================

export function volerVersPanier(sourceEl) {
  try {
    const cible = document.querySelector('[aria-label="Voir le panier"]')
    if (!sourceEl || !cible) return

    const depart = sourceEl.getBoundingClientRect()
    const arrivee = cible.getBoundingClientRect()
    if (depart.width === 0 || arrivee.width === 0) return

    // Un clone de la photo, posé par-dessus la page
    const clone = sourceEl.cloneNode(true)
    Object.assign(clone.style, {
      position: 'fixed',
      left: `${depart.left}px`,
      top: `${depart.top}px`,
      width: `${depart.width}px`,
      height: `${depart.height}px`,
      margin: '0',
      zIndex: '9999',
      pointerEvents: 'none',
      borderRadius: '14px',
      objectFit: 'contain',
      background: '#ffffff',
      boxShadow: '0 12px 30px -12px rgba(52, 34, 47, 0.45)',
    })
    document.body.appendChild(clone)

    const dx = arrivee.left + arrivee.width / 2 - (depart.left + depart.width / 2)
    const dy = arrivee.top + arrivee.height / 2 - (depart.top + depart.height / 2)

    // Trajet en cloche : ça monte un peu, puis ça plonge dans le panier
    clone.animate(
      [
        { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: 1 },
        {
          transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 60}px) scale(0.5) rotate(-8deg)`,
          opacity: 0.95,
          offset: 0.6,
        },
        { transform: `translate(${dx}px, ${dy}px) scale(0.1) rotate(4deg)`, opacity: 0.15 },
      ],
      { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' },
    )

    // Nettoyage GARANTI (même si l'animation est interrompue : onglet
    // caché, navigation…) + rebond du panier à la réception.
    setTimeout(() => {
      clone.remove()
      cible.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.28)' }, { transform: 'scale(1)' }],
        { duration: 320, easing: 'ease-out' },
      )
    }, 680)
  } catch {
    /* décoratif : ne doit jamais casser l'ajout au panier */
  }
}
