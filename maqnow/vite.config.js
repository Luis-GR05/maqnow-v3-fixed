import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relativa: el build funciona en un dominio propio o en una subcarpeta
export default defineConfig({ base: './', plugins: [react()] });
