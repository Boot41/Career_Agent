import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/static/client/', // Ensure correct base path
  build: {
    outDir: 'dist',
  },
  
  server: {
    proxy: {
      '/auth': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false
      },
      '/org': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false
      },
      '/feedback': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
