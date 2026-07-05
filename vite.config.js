import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // Chemins relatifs : le site fonctionne aussi bien en local
  // qu'une fois publié dans un sous-dossier sur GitHub Pages.
  base: './',
  plugins: [react(), tailwindcss()],
})
