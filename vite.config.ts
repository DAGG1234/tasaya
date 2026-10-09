import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['logoTasaYa.png', 'favicon.ico'],
      manifest: {
        name: 'TasaYa - Conversor Oficial y P2P',
        short_name: 'TasaYa',
        description: 'Conversor de tasas BCV y USDT en Venezuela',
        theme_color: '#00E676',
        background_color: '#121212',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/logoTasaYa.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logoTasaYa.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ]
});