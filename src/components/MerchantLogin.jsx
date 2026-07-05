import { useState } from 'react'
import { ArrowLeft, Lock } from 'lucide-react'
import Logo from './Logo'

// Code d'accès réservé au boulanger (protection simple, côté front).
// Pour le MVP, le code est en dur. Avec un vrai back-end, ce sera
// un vrai compte (identifiant + mot de passe sécurisés).
const CODE_PRO = '1987'

export default function MerchantLogin({ onSucces, onRetour }) {
  const [code, setCode] = useState('')
  const [erreur, setErreur] = useState(false)

  function valider(e) {
    e.preventDefault()
    if (code === CODE_PRO) {
      onSucces()
    } else {
      setErreur(true)
      setCode('')
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm animate-pop-in rounded-2xl border border-sand bg-paper p-7 text-center">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-4 text-2xl text-ink">Espace boulanger</h1>
        <p className="mt-1 text-sm text-stone-warm">
          Accès réservé à l’équipe de La Pétrie. Saisissez votre code — il sera
          mémorisé sur cet appareil.
        </p>

        <form onSubmit={valider} className="mt-6">
          <div className="relative">
            <Lock
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-warm"
            />
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={code}
              onChange={(e) => {
                setCode(e.target.value)
                setErreur(false)
              }}
              placeholder="Code d’accès"
              className={`w-full rounded-lg border bg-cream py-3 pl-10 pr-4 text-center text-lg tracking-widest outline-none transition ${
                erreur
                  ? 'border-rose-300 focus:ring-2 focus:ring-rose-200'
                  : 'border-sand focus:border-crust focus:ring-2 focus:ring-crust/15'
              }`}
            />
          </div>

          {erreur && (
            <p className="mt-2 text-sm text-rose-600">Code incorrect. Réessayez.</p>
          )}

          <button
            type="submit"
            className="mt-5 w-full rounded-lg bg-crust py-3.5 font-semibold text-white transition-colors hover:bg-crust-dark active:scale-[0.99]"
          >
            Accéder à l’espace
          </button>
        </form>

        <button
          type="button"
          onClick={onRetour}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-stone-warm transition-colors hover:text-ink"
        >
          <ArrowLeft size={15} /> Retour au site
        </button>

        <p className="mt-4 border-t border-sand pt-4 text-xs text-stone-warm/80">
          Astuce : ajoutez <span className="font-semibold text-crust">#pro</span> à l’adresse
          du site pour arriver directement ici.
        </p>
      </div>
    </div>
  )
}
