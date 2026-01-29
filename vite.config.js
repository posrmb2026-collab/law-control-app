import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'error', // Suppress warnings, only show errors
  plugins: [
    base44({
      // Support for legacy code that imports the base44 SDK with @/integrations, @/entities, etc.
      // can be removed if the code has been updated to use the new SDK imports from @base44/sdk
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === 'true'
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    // Otimizações de bundle
    rollupOptions: {
      output: {
        // Code splitting manual para vendors grandes
        manualChunks: {
          // React e dependências core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI components (Radix UI)
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            '@radix-ui/react-toast',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
          ],
          
          // Data fetching e state management
          'query-vendor': ['@tanstack/react-query', '@tanstack/react-virtual'],
          
          // Utilities
          'utils-vendor': ['date-fns', 'lodash', 'clsx', 'tailwind-merge'],
          
          // Forms e validação
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          
          // Animações (separado pois é grande)
          'animation-vendor': ['framer-motion'],
          
          // Charts e visualizações
          'chart-vendor': ['recharts'],
          
          // Editor de texto
          'editor-vendor': ['react-quill'],
        }
      }
    },
    
    // Minificação agressiva
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log em produção
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: {
        safari10: true,
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000, // 1MB
    
    // Source maps apenas para erros
    sourcemap: false,
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Otimizações de assets
    assetsInlineLimit: 4096, // 4KB - inline pequenos assets como base64
  },
  
  // Otimizações de desenvolvimento
  server: {
    port: 3000,
    strictPort: false,
    hmr: {
      overlay: true,
    },
  },
  
  // Otimizações de preview
  preview: {
    port: 3000,
  },
  
  // Otimizações de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'date-fns',
    ],
    exclude: ['@base44/sdk'], // Não otimizar SDK do Base44
  },
});
