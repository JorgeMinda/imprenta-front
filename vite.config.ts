import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
  server: {
    proxy: {
      // Cada vez que hagas un fetch a '/api/...' en tu código, 
      // Vite lo redirigirá automáticamente a Render.
      '/api': {
        target: 'https://imprenta-back-1.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, 
  },
})