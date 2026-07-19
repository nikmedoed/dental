import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  base: './',
  build: {
    // Firebase is lazy-loaded only when environment keys are configured.
    chunkSizeWarningLimit: 600
  }
});
