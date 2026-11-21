import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // jsdom para los componentes; los tests de utils no lo necesitan pero no estorba.
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/configuracion.js'],
    include: ['src/**/*.test.{js,jsx}'],
  },
})
