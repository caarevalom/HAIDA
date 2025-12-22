import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to backend during development
      // Uncomment if you need to bypass CORS during local development
      // '/api': {
      //   target: 'https://haida-one.vercel.app',
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, ''),
      // },
    },
  },
  define: {
    // Make env variables available
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://haida-one.vercel.app'),
  },
})
