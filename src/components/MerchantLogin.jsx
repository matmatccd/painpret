import { useState } from 'react'
import { ArrowLeft, Lock } from 'lucide-react'
import Logo from './Logo'
import { supabase, modeReel } from '../lib/supabase'

// Code d'accès de secours en mode démo (pas de base configurée).
const CODE_DEMO = '1987'
// Email du compte boulanger (identifiant fixe, caché au boulanger).
// L'email seul ne donne aucun accès : c'est le CODE (= mot de passe) qui protège.
const PRO_EMAIL = import.meta.env.VITE_PRO_EMAIL || ''

// Accès à l'espace boulanger par un simple CODE.
// En mode réel, le code saisi est utilisé comme mot de passe Supabase
// (avec l'email du compte, caché) : simple pour le boulanger, sûr.
export default function MerchantLogin({ onSucces, onRetour }) {
  const [code, setCode] = useState('')
  const [erreur, setErreur] = useState('')
  const [enCours, setEnCours] = useState(false)

  async function valider(e) {
    e.preventDefault()
    setErreur('')

    // --- Mode démo : simple code d'accès local ---
    if (!modeReel) {
      if (code === CODE_DEMO) onSucces()
      else {
        setErreur('Code incorrect. Réessayez.')
        setCode('')
      }
      return
    }

    // --- Mode réel : le code EST le mot de passe du compte boulanger ---
    setEnCours(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: PRO_EMAIL,
      password: code,
    })
    setEnCours(false)
    if (error) {
      setErreur('Code incorrect. Réessayez.')
      setCode('')
    } else {
      onSucces()
    }
  }

  const champ =
    'w-full rounded-lg border border-sand bg-cream py-3 pl-10 pr-4 text-sm outline-none transition focus:border-crust focus:ring-2 focus:ring-crust/15'

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm animate-pop-in rounded-2xl border border-sand bg-paper p-7 text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-4 text-2xl text-ink">Espace boulanger</h1>
        <p className="mt-1 text-sm text-stone-warm">
          Accès réservé à l’équipe de La Pétrie.
        </p>

        <form onSubmit={valider} className="mt-6 space-y-3 text-left">
          <div className="relative">
            <Lock size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-warm" />
            <input
              type="password"
              autoFocus
              value={code}
              onChange={(e) => { setCode(e.target.value); setErreur('') }}
              placeholder="Code d’accès"
              autoComplete="off"
              className={`${champ} text-center tracking-widest`}
            />
          </div>

          {erreur && <p className="text-sm text-rose-600">{erreur}</p>}

          <button
            type="submit"
            disabled={enCours}
            className="w-full rounded-lg bg-crust py-3.5 font-semibold text-white transition-colors hover:bg-crust-dark active:scale-[0.99] disabled:bg-sand disabled:text-stone-warm"
          >
            {enCours ? 'Connexion…' : 'Accéder à l’espace'}
          </button>
        </form>

        <button
          type="button"
          onClick={onRetour}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-stone-warm transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} /> Retour au site
        </button>
      </div>
    </div>
  )
}
