import { useEffect, useRef, useState } from 'react'

// Fait apparaître son contenu en douceur quand il entre dans l'écran
// (une seule fois). Si le navigateur ne sait pas faire : tout reste visible.
export default function Reveal({ children, className = '' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    if (visible || !ref.current) return
    const observateur = new IntersectionObserver(
      ([entree]) => {
        if (entree.isIntersecting) {
          setVisible(true)
          observateur.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    observateur.observe(ref.current)
    return () => observateur.disconnect()
  }, [visible])

  return (
    <div ref={ref} className={`${visible ? 'animate-fade-up' : 'opacity-0'} ${className}`}>
      {children}
    </div>
  )
}
