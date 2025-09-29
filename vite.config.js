import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // 👇 Cargar las variables de entorno del archivo .env correspondiente
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/toma-de-fotos/',
    plugins: [
      vue(),
      tailwindcss(),
    ],
    server: {
      host: true,
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,   //
          changeOrigin: true,
        },
      },
    },
  }
})
