import { Wheat } from 'lucide-react'

// Logo de la marque PainPrêt : épi de blé sur tuile "croûte" + nom en Calistoga.
// - taille : 'sm' (en-têtes) ou 'md' (pages d'accueil / connexion)
// - clair  : true sur fond sombre (texte blanc)
export default function Logo({ taille = 'md', clair = false }) {
  const dims =
    taille === 'sm'
      ? { tuile: 'h-8 w-8 rounded-lg', icone: 16, texte: 'text-lg' }
      : { tuile: 'h-10 w-10 rounded-xl', icone: 20, texte: 'text-2xl' }

  return (
    <span className="inline-flex items-center gap-2">
      <span className={`flex ${dims.tuile} items-center justify-center bg-crust text-white`}>
        <Wheat size={dims.icone} strokeWidth={2.2} />
      </span>
      <span className={`font-display ${dims.texte} ${clair ? 'text-white' : 'text-ink'}`}>
        PainPrêt
      </span>
    </span>
  )
}
