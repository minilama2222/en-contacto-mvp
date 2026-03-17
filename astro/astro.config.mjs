import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://en-contacto-mvp.vercel.app',
  base: '/',
  output: 'static',
  build: {
    format: 'directory'
  },
  vite: {
    build: {
      assetsInlineLimit: 0
    }
  }
});
