import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base: set to your GitHub Pages repo name, e.g. '/tangram-app/'
export default defineConfig({
  plugins: [react()],
  base: '/tangram-app/',
})
