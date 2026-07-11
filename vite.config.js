import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Chemins relatifs : le site fonctionne aussi bien en local
  // qu'une fois publié dans un sous-dossier sur GitHub Pages.
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    // PWA : PainPrêt s'installe comme une vraie application
    // (icône sur l'écran d'accueil, plein écran, démarrage rapide).
    VitePWA({
      registerType: 'autoUpdate', // se met à jour tout seul à chaque déploiement
      manifest: {
        name: 'PainPrêt — La Pétrie',
        short_name: 'PainPrêt',
        description:
          'Commandez votre pain en ligne chez La Pétrie (Reims), choisissez votre créneau et repartez sans attendre.',
        lang: 'fr',
        display: 'standalone',
        start_url: '.',
        scope: '.',
        theme_color: '#6f2f43',
        background_color: '#faf3f1',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Les photos sont lourdes : on autorise leur mise en cache
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // On greffe notre gestionnaire de notifications push au service worker
        importScripts: ['push-sw.js'],
      },
    }),
  ],
})
