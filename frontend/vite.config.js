import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/fileverse-midnight-neon/',
  server: {
    hmr: {
      overlay: false,
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50MB to accommodate FFmpeg WASM binaries
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm}']
      },
      manifest: {
        name: 'FileVerze — Private In-Browser File Converter (Midnight Neon)',
        short_name: 'FileVerze',
        description: 'Free, 100% in-browser file converter and privacy powerhouse. Process PDFs, images, videos, 3D models, fonts, and spreadsheets locally.',
        theme_color: '#0F172A',
        background_color: '#F8FAFC',
        display: 'standalone',
        categories: ['productivity', 'utilities', 'photo', 'video', 'developer'],
        icons: [
          {
            src: './favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'vendor-three';
          if (id.includes('node_modules/pdfjs-dist') || id.includes('node_modules/pdf-lib')) return 'vendor-pdf';
          if (id.includes('node_modules/@ffmpeg')) return 'vendor-ffmpeg';
          if (id.includes('node_modules/tesseract.js')) return 'vendor-tesseract';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) return 'vendor-react';
        }
      }
    }
  }
})
