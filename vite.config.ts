import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' permite publicar el sitio en cualquier carpeta o subruta.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
