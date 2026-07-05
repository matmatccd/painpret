import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ShopProvider } from './context/ShopContext'
import { CartProvider } from './context/CartContext'
import { NotificationsProvider } from './context/NotificationsContext'

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
