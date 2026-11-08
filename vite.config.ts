import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { seo } from './seo.config.ts'

export default defineConfig({
  plugins: [react(), tailwindcss(), seo()],
  build: {
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/gsap')) return 'gsap'
          if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) return 'motion'
          if (id.includes('node_modules/react')) return 'react'
        },
      },
    },
  },
})
