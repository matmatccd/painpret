import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { themeActuel, basculerTheme } from '../lib/theme'

// Petit bouton lune/soleil dans le bandeau.
// L'icône tourne et se fond quand on bascule.
export default function BoutonTheme() {
  const [theme, setTheme] = useState(() => themeActuel())
  const sombre = theme === 'sombre'

  return (
    <button
      type="button"
      onClick={() => setTheme(basculerTheme())}
      aria-label={sombre ? 'Passer en mode clair' : 'Passer en mode sombre'}
      title={sombre ? 'Mode clair' : 'Mode sombre'}
      className="icone-vive flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/85 ring-1 ring-white/20 transition-colors hover:bg-white/15 hover:text-[#e9cd90] hover:ring-[#e9cd90]/60"
    >
      {/* Les deux icônes sont superposées : celle qui sort pivote et s'efface */}
      <span className="relative flex h-[18px] w-[18px] items-center justify-center">
        <Sun
          size={18}
          className={`absolute transition-all duration-300 ${
            sombre ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
        <Moon
          size={18}
          className={`absolute transition-all duration-300 ${
            sombre ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'
          }`}
        />
      </span>
    </button>
  )
}
