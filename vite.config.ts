import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  build: {
    rollupOptions: {
      output: {
        // Esta función divide automáticamente los paquetes de node_modules
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Opcional: aumenta el límite de la advertencia si sabes que tu App es pesada
    chunkSizeWarningLimit: 1000, 
  },
})