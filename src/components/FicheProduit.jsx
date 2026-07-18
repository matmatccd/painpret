import { useState } from 'react'
import { ArrowLeft, Minus, Plus, Timer, CheckCircle2, Leaf, ShieldAlert } from 'lucide-react'
import { formatPrix } from '../lib/format'
import { useCart } from '../context/CartContext'
import { volerVersPanier } from '../lib/volAuPanier'
import ProductCard from './ProductCard'

// Fiche détaillée d'un produit (+ suggestions de la même catégorie).
export default function FicheProduit({ produit, onRetour, onAjoutReussi, suggestions = [], onOpen }) {
  const { ajouter } = useCart()
  const [quantite, setQuantite] = useState(1)
  const [remarque, setRemarque] = useState('')
  const [variante, setVariante] = useState(
    produit.variantes ? produit.variantes.options[0] : null,
  )
  // Goût sélectionné. Prioritaire sur les variantes.
  const [gout, setGout] = useState(produit.gouts?.length ? produit.gouts[0] : null)
  // Le visuel affiché = la photo du goût choisi si elle existe, sinon la photo du produit
  const visuel = gout?.image || produit.image

  const epuise = !produit.disponible
  const prixUnitaire = variante ? variante.prix : produit.prix
  const prixTotal = prixUnitaire * quantite
  // Nom de la déclinaison envoyé au panier : le goût s'il existe, sinon la variante
  const declinaison = gout ? gout.nom : variante ? variante.nom : null

  function ajouterAuPanier() {
    if (epuise) return
    ajouter(produit, {
      quantite,
      varianteNom: declinaison,
      prixUnitaire,
      remarque: remarque.trim(),
    })
    // La photo s'envole vers le panier de l'en-tête
    const photo = document.querySelector('.produit-3d')
    if (photo) volerVersPanier(photo)
    onAjoutReussi?.()
  }

  return (
    <div className="mx-auto w-full max-w-4xl animate-fade-up px-4 py-6">
      <button
        type="button"
        onClick={onRetour}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-stone-warm transition-colors hover:text-ink"
      >
        <ArrowLeft size={16} />
        Retour à la boutique
      </button>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Visuel façon vitrine : fond doux, produit qui tourne légèrement
            en 3D (comme le téléphone de la démo), ombre portée qui respire. */}
        <div
          className="scene-3d relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl border border-sand"
          style={
            visuel
              ? { background: 'radial-gradient(circle at 50% 38%, #ffffff 0%, #fdf7f5 55%, #f4e4e0 100%)' }
              : { background: `linear-gradient(150deg, ${produit.from}, ${produit.to})` }
          }
        >
          {visuel ? (
            <>
              <img
                key={visuel}
                src={visuel}
                alt={gout ? `${produit.nom} ${gout.nom}` : produit.nom}
                className={`produit-3d relative z-10 h-[74%] w-full animate-fade-up object-contain px-8 mix-blend-multiply ${epuise ? 'opacity-40 grayscale' : ''}`}
              />
              {/* L'ombre au sol suit la rotation du produit */}
              <div
                className="produit-ombre -mt-[5%] h-4 w-2/5 rounded-[100%] bg-ink/25 blur-md"
                aria-hidden="true"
              />
            </>
          ) : (
            <span className={`text-[7rem] ${epuise ? 'opacity-40 grayscale' : ''}`}>{produit.emoji}</span>
          )}

          {/* Teinte du goût seulement s'il n'a PAS de photo dédiée (repli) */}
          {gout && !gout.image && (
            <div
              className="pointer-events-none absolute inset-0 transition-colors duration-300"
              style={{ backgroundColor: gout.couleur, opacity: 0.4, mixBlendMode: 'multiply' }}
            />
          )}
          {produit.nouveau && !epuise && (
            <span className="absolute left-4 top-4 rounded-full bg-paper/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-crust">
              Nouveau
            </span>
          )}
          {epuise && (
            <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-2 text-center text-sm font-semibold uppercase tracking-widest text-white">
              Épuisé aujourd'hui
            </span>
          )}
        </div>

        {/* Infos */}
        <div className="flex flex-col">
          {produit.sousCategorie && (
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-ember">
              {produit.sousCategorie}
            </p>
          )}
          <h1 className="text-3xl text-ink sm:text-4xl">{produit.nom}</h1>
          <span className="filet-titre" aria-hidden="true" />

          <div className="mt-2 flex items-center gap-3">
            <span className="price text-2xl font-bold text-ember">{formatPrix(prixUnitaire)}</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {produit.disponible ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
                <CheckCircle2 size={14} /> Disponible
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-xs font-medium text-stone-warm ring-1 ring-sand">
                Épuisé
              </span>
            )}
            {produit.delaiPreparation > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-xs font-medium text-crust ring-1 ring-sand">
                <Timer size={14} /> Prêt en ~{produit.delaiPreparation} min
              </span>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-stone-warm">{produit.description}</p>

          {/* Goûts (avec teinte du visuel) */}
          {produit.gouts?.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-ink">Goût</p>
              <div className="flex flex-wrap gap-2">
                {produit.gouts.map((g) => {
                  const choisi = gout?.nom === g.nom
                  return (
                    <button
                      key={g.nom}
                      type="button"
                      onClick={() => setGout(g)}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        choisi ? 'bg-ink text-white' : 'border border-sand bg-paper text-ink hover:border-crust/40'
                      }`}
                    >
                      <span className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10" style={{ backgroundColor: g.couleur }} />
                      {g.nom}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Variantes */}
          {produit.variantes && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold text-ink">{produit.variantes.label}</p>
              <div className="flex flex-wrap gap-2">
                {produit.variantes.options.map((opt) => {
                  const choisi = variante?.nom === opt.nom
                  return (
                    <button
                      key={opt.nom}
                      type="button"
                      onClick={() => setVariante(opt)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        choisi
                          ? 'bg-ink text-white'
                          : 'border border-sand bg-paper text-ink hover:border-crust/40'
                      }`}
                    >
                      {opt.nom}
                      {opt.prix !== produit.variantes.options[0].prix && (
                        <span className="ml-1.5 opacity-70">{formatPrix(opt.prix)}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Ingrédients */}
          {produit.ingredients && (
            <div className="mt-6">
              <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Leaf size={15} className="text-emerald-600" /> Ingrédients
              </p>
              <p className="text-sm text-stone-warm">{produit.ingredients.join(', ')}.</p>
            </div>
          )}

          {/* Allergènes */}
          {produit.allergenes && produit.allergenes.length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-ink">
                <ShieldAlert size={15} className="text-rose-500" /> Allergènes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {produit.allergenes.map((a) => (
                  <span
                    key={a}
                    className="rounded-md bg-cream px-2 py-0.5 text-xs font-medium text-stone-warm ring-1 ring-sand"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Remarque */}
          <div className="mt-6">
            <label htmlFor="remarque" className="mb-1.5 block text-sm font-semibold text-ink">
              Une remarque ? <span className="font-normal text-stone-warm">(facultatif)</span>
            </label>
            <input
              id="remarque"
              type="text"
              value={remarque}
              onChange={(e) => setRemarque(e.target.value)}
              placeholder="Ex : bien cuit, peu cuit…"
              className="w-full rounded-lg border border-sand bg-paper px-3.5 py-2.5 text-sm outline-none transition placeholder:text-stone-warm/70 focus:border-crust focus:ring-2 focus:ring-crust/15"
            />
          </div>

          {/* Quantité + ajout */}
          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-sand bg-paper">
              <button
                type="button"
                aria-label="Diminuer la quantité"
                onClick={() => setQuantite((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center text-stone-warm transition-colors hover:text-ink"
              >
                <Minus size={18} />
              </button>
              <span className="tnum w-8 text-center text-lg font-semibold">{quantite}</span>
              <button
                type="button"
                aria-label="Augmenter la quantité"
                onClick={() => setQuantite((q) => Math.min(q + 1, produit.stock ?? 99))}
                className="flex h-11 w-11 items-center justify-center text-stone-warm transition-colors hover:text-ink"
              >
                <Plus size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={ajouterAuPanier}
              disabled={epuise}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-crust px-5 py-3.5 font-semibold text-white transition-colors hover:bg-crust-dark active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-sand disabled:text-stone-warm"
            >
              {epuise ? 'Indisponible' : `Ajouter · ${formatPrix(prixTotal)}`}
            </button>
          </div>
        </div>
      </div>

      {/* Suggestions de la même catégorie */}
      {suggestions.length > 0 && (
        <section className="mt-10">
          <header className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ember">Nos suggestions</p>
            <h2 className="mt-1 text-2xl text-ink">À goûter aussi</h2>
            <span className="filet-titre" aria-hidden="true" />
          </header>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {suggestions.map((p, i) => (
              <ProductCard key={p.id} produit={p} onOpen={onOpen} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
