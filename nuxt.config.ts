import Aura from '@primeuix/themes/aura';


export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@primevue/nuxt-module',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  primevue: {
      options: {
          theme: {
              preset: Aura
          }
      }
  }
})