import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://minilama2222.github.io',
  base: '/en-contacto-mvp',
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
