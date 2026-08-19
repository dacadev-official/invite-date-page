import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// vite-plugin-vue-devtools se quitó: su dependencia transitiva
// (@vue/babel-plugin-jsx@1.5.0, vía vite-plugin-vue-inspector@6.0.0) importa
// `isHTMLTag`/`isSVGTag` desde 'vue', que Vue 3.5.41 ya no exporta en su
// raíz — rompe `vitest`/`vite dev` al cargar la config. Es solo el panel de
// devtools del navegador; no afecta la build ni el runtime de la app.

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
