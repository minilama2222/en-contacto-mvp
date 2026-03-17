import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://en-contacto-mvp.vercel.app',
  base: '/',
  output: 'static',
  build: {
    format: 'file'
  },
  vite: {
    build: {
      assetsInlineLimit: 0
    }
  }
});
