import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relativa: el build funciona en un dominio propio o en una subcarpeta (GitHub Pages)
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // React aparte: cambia poco y el navegador lo guarda en caché entre versiones
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
          return undefined;
        },
      },
    },
  },
});
