import { defineConfig } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    // Bundle analyzer - generates stats.html after build
    visualizer({
      open: false, // Don't open automatically
      filename: 'dist/stats.html',
      template: 'treemap', // treemap, sunburst, network
      gzipSize: true,
      brotliSize: true,
    }),
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
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'https://haida-one.vercel.app'
    ),
  },
  build: {
    // Optimize bundle
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
    rollupOptions: {
      output: {
        // Manual chunking for better caching
        manualChunks: {
          // Core React
          'vendor-react': ['react', 'react-dom', 'react/jsx-runtime'],

          // Radix UI components (grouped)
          'vendor-ui-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
          ],

          // Form libraries
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],

          // Charts and heavy visualizations
          'vendor-charts': ['recharts'],

          // Animations
          'vendor-animations': ['motion'],

          // Utilities
          'vendor-utils': [
            'date-fns',
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
          ],

          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],

          // Icons
          'vendor-icons': ['lucide-react'],
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 500,
  },
});
