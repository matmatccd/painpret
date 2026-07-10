// Logo PainPrêt : épi de blé doré dessiné sur mesure (SVG),
// posé sur une tuile prune avec filet doré — comme l'enseigne La Pétrie.
// - taille : 'sm' (en-têtes) ou 'md' (pages d'accueil / connexion)
// - clair  : true sur fond sombre (texte blanc)

// L'épi : tige + 3 paires de grains + grain de tête, en doré de la façade.
function EpiDore({ taille }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={taille}
      height={taille}
      aria-hidden="true"
      className="logo-ble"
    >
      {/* Tige */}
      <path
        d="M24 45 C24 36 24 26 24 13"
        fill="none"
        stroke="#e9cd90"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Feuille basse */}
      <path
        d="M24 41 C17 41.5 12.5 38 11 32.5 C17.5 33 22 36 24 41Z"
        fill="#e9cd90"
        opacity="0.55"
      />
      {/* Paires de grains (bas → haut) */}
      <path d="M24 35 C18.4 34 15 30.4 14.5 25 C20.2 26 23.5 29.6 24 35Z" fill="#e9cd90" />
      <path d="M24 35 C29.6 34 33 30.4 33.5 25 C27.8 26 24.5 29.6 24 35Z" fill="#e9cd90" />
      <path d="M24 26.5 C18.8 25.5 15.7 22 15.2 17 C20.6 18 23.6 21.4 24 26.5Z" fill="#e9cd90" />
      <path d="M24 26.5 C29.2 25.5 32.3 22 32.8 17 C27.4 18 24.4 21.4 24 26.5Z" fill="#e9cd90" />
      <path d="M24 18.5 C20.4 16.6 18.8 13 19.3 8.8 C22.7 10.8 24.3 14.3 24 18.5Z" fill="#e9cd90" />
      <path d="M24 18.5 C27.6 16.6 29.2 13 28.7 8.8 C25.3 10.8 23.7 14.3 24 18.5Z" fill="#e9cd90" />
      {/* Grain de tête */}
      <path d="M24 11 C22.2 8.6 22.2 5.4 24 3 C25.8 5.4 25.8 8.6 24 11Z" fill="#f7e8c4" />
    </svg>
  )
}

export default function Logo({ taille = 'md', clair = false }) {
  const dims =
    taille === 'sm'
      ? { tuile: 'h-9 w-9 rounded-xl', epi: 26, texte: 'text-lg' }
      : { tuile: 'h-11 w-11 rounded-2xl', epi: 32, texte: 'text-2xl' }

  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`flex ${dims.tuile} items-center justify-center overflow-hidden ${
          clair
            ? 'bg-white/10 ring-1 ring-[#e9cd90]/50'
            : 'bg-crust ring-1 ring-[#e9cd90]/60'
        }`}
      >
        <EpiDore taille={dims.epi} />
      </span>
      <span className={`font-display ${dims.texte} ${clair ? 'text-white' : 'text-ink'}`}>
        Pain<span className={clair ? 'text-[#e9cd90]' : 'text-ember'}>Prêt</span>
      </span>
    </span>
  )
}
