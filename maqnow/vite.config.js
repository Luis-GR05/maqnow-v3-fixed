import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { HERO_IDS, HERO_TALL, HERO_WIDE, photoSet } from './src/data/images.js';

// Precargas de la portada: la foto (recorte vertical o apaisado, igual que el <picture> del hero)
// y las dos tipografías que se ven nada más abrir. Así el navegador las pide sin esperar al CSS ni al JS.
function preloads() {
  const img = (media, set) => ({
    tag: 'link', injectTo: 'head',
    attrs: { rel: 'preload', as: 'image', fetchpriority: 'high', crossorigin: 'anonymous', media, imagesrcset: photoSet(HERO_IDS[0], set.widths, set.ratio), imagesizes: '100vw' },
  });
  return {
    name: 'maqnow-preloads',
    transformIndexHtml(html, ctx) {
      const tags = [img(HERO_TALL.media, HERO_TALL), img(`not all and ${HERO_TALL.media}`, HERO_WIDE)];
      const fonts = Object.keys(ctx.bundle || {}).filter((f) => /barlow-condensed-latin-800-normal.*\.woff2$|barlow-latin-(400|600)-normal.*\.woff2$/.test(f));
      fonts.forEach((f) => tags.push({ tag: 'link', injectTo: 'head', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: 'anonymous', href: `./${f}` } }));
      return tags;
    },
  };
}

// base relativa: el build funciona en un dominio propio o en una subcarpeta (GitHub Pages)
export default defineConfig({
  base: './',
  plugins: [react(), preloads()],
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
