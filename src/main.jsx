import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ShopProvider } from './context/ShopContext'
import { CartProvider } from './context/CartContext'
import { NotificationsProvider } from './context/NotificationsContext'

// Mise à jour automatique de l'appli installée.
// Sans ça, un appareil garde l'ancienne version en mémoire jusqu'à ce que
// l'utilisateur recharge une deuxième fois (nouveaux prix/produits invisibles).
// Ici : dès qu'une nouvelle version prend la main, la page se recharge seule.
if ('serviceWorker' in navigator) {
  // Y avait-il déjà une version active ? (sinon c'est la 1re installation :
  // inutile de recharger)
  const miseAJour = Boolean(navigator.serviceWorker.controller)
  let dejaRecharge = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!miseAJour || dejaRecharge) return
    dejaRecharge = true
    window.location.reload()
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Magasin partagé (produits + commandes), panier, puis notifications. */}
    <ShopProvider>
      <CartProvider>
        <NotificationsProvider>
          <App />
        </NotificationsProvider>
      </CartProvider>
    </ShopProvider>
  </StrictMode>,
)
