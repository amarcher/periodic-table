import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { staticPages } from './scripts/static-pages'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), staticPages(loadEnv(mode, process.cwd(), 'VITE_VIDEO_CDN_URL').VITE_VIDEO_CDN_URL)],
}))
