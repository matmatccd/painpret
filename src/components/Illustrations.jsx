// ============================================================
//  Petites illustrations SVG maison, aux couleurs de La Pétrie,
//  pour habiller les états vides ("panier vide", "rien à préparer"…).
// ============================================================

// Une baguette dorée qui fume encore, posée sur sa planche
export function IllustrationPain({ taille = 104 }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 104 104" fill="none" aria-hidden="true">
      {/* la planche */}
      <ellipse cx="52" cy="80" rx="34" ry="7" fill="#f0dcd8" />
      {/* la baguette */}
      <g transform="rotate(-22 52 60)">
        <rect x="16" y="52" width="72" height="20" rx="10" fill="#e6b276" stroke="#c98a3a" strokeWidth="2" />
        <path
          d="M33 55.5 l6 13 M47 54.5 l6 14 M61 54.5 l6 14"
          stroke="#a86a2c"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </g>
      {/* la vapeur, encore chaude */}
      <path
        d="M38 30 c-3 -5 3 -7 0 -12 M54 26 c-3 -5 3 -7 0 -12 M68 32 c-3 -5 3 -7 0 -12"
        stroke="#b98a2f"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  )
}

// Un panier en osier avec deux baguettes qui dépassent
export function IllustrationPanier({ taille = 104 }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 104 104" fill="none" aria-hidden="true">
      {/* les baguettes qui dépassent */}
      <rect x="31" y="16" width="12" height="42" rx="6" transform="rotate(-14 37 37)" fill="#e6b276" stroke="#c98a3a" strokeWidth="2" />
      <rect x="59" y="12" width="12" height="46" rx="6" transform="rotate(10 65 35)" fill="#eec489" stroke="#c98a3a" strokeWidth="2" />
      {/* le panier */}
      <path d="M24 50 h56 l-7 33 a6 6 0 0 1 -6 5 h-30 a6 6 0 0 1 -6 -5 z" fill="#a5714a" stroke="#7c5236" strokeWidth="2" />
      {/* le tressage */}
      <path d="M27.5 59 h49 M29.5 68 h45 M31.5 77 h41" stroke="#7c5236" strokeWidth="1.6" opacity="0.5" />
      <path d="M37 50 l5.5 37 M52 50 v38 M67 50 l-5.5 37" stroke="#7c5236" strokeWidth="1.6" opacity="0.4" />
      {/* le bord */}
      <rect x="22" y="46" width="60" height="8" rx="4" fill="#b98a2f" stroke="#7c5236" strokeWidth="1.6" />
    </svg>
  )
}
