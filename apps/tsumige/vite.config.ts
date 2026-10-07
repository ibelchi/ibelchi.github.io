import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/tsumige/',
  plugins: [react(), tailwindcss()],
  resolve: {
    preserveSymlinks: true,
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
