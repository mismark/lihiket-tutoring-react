import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(),

    // ── Progressive Web App ──────────────────────────────────────────────────
    VitePWA({
      // "generateSW" lets Workbox build the service worker automatically.
      // No hand-written SW file is needed.
      strategies: 'generateSW',

      // The generated sw.js is placed at the root so browsers can scope it
      // to the whole origin.
      filename: 'sw.js',

      // Register the SW automatically on page load.
      registerType: 'autoUpdate',

      // Suppress the dev-mode warning; enable SW in dev only if you need to
      // test caching. Leave false so hot-reload works normally.
      devOptions: {
        enabled: false,
      },

      // ── Web-app manifest ────────────────────────────────────────────────────
      // vite-plugin-pwa will inject <link rel="manifest"> and validate the
      // manifest; the manual /site.webmanifest link in index.html is kept as
      // a fallback and is still valid.
      manifest: {
        name: 'Lihiket Tutoring Platform',
        short_name: 'Lihiket',
        description:
          'Online tutoring platform — live classes, assignments, quizzes, exams and more',
        id: '/',           // required for TWA / Play Store identity
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#0f172a',
        theme_color: '#0f172a',
        categories: ['education'],
        lang: 'en',
        dir: 'ltr',
        icons: [
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icon-512.png',          sizes: '512x512', type: 'image/png', purpose: 'any'      },
          { src: '/icon-192.png',          sizes: '192x192', type: 'image/png', purpose: 'any'      },
          { src: '/icon-384.png',          sizes: '384x384', type: 'image/png', purpose: 'any'      },
          { src: '/icon-180.png',          sizes: '180x180', type: 'image/png', purpose: 'any'      },
          { src: '/icon-152.png',          sizes: '152x152', type: 'image/png', purpose: 'any'      },
          { src: '/icon-144.png',          sizes: '144x144', type: 'image/png', purpose: 'any'      },
          { src: '/icon-128.png',          sizes: '128x128', type: 'image/png', purpose: 'any'      },
          { src: '/icon-96.png',           sizes: '96x96',   type: 'image/png', purpose: 'any'      },
          { src: '/icon-72.png',           sizes: '72x72',   type: 'image/png', purpose: 'any'      },
        ],
      },

      // ── Workbox runtime caching rules ───────────────────────────────────────
      workbox: {
        // Pre-cache all built assets (JS, CSS, fonts, images) that Vite emits.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2}'],

        // ── Runtime cache rules ────────────────────────────────────────────
        runtimeCaching: [
          // Google Fonts — stale-while-revalidate, 1-year TTL
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // Unsplash images (used on the home page gallery) — CacheFirst
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // API calls — NetworkOnly so stale data is never served from cache.
          // This is critical: private student/teacher/payment data must never
          // be cached in the service worker.
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkOnly',
          },

          // Uploaded files (served by the Express backend) — NetworkOnly.
          {
            urlPattern: /\/uploads\/.*/i,
            handler: 'NetworkOnly',
          },
        ],

        // For ALL navigation requests (page loads), fall back to index.html
        // so React Router handles the route — this is the correct SPA pattern.
        // The offline.html is only shown when the network request genuinely fails.
        navigateFallback: '/index.html',

        // Never apply the SPA fallback to API, uploads, or the offline page itself.
        navigateFallbackDenylist: [/^\/api\//, /^\/uploads\//, /^\/offline\.html$/],

        // Skip waiting and claim clients so updates apply as soon as possible.
        skipWaiting: true,
        clientsClaim: true,
      },

      // Tell vite-plugin-pwa that these files exist in /public and should be
      // included in the pre-cache manifest.
      includeAssets: [
        'favicon.svg', 'favicon-32.png',
        'icon-72.png', 'icon-96.png', 'icon-128.png', 'icon-144.png',
        'icon-152.png', 'icon-180.png', 'icon-192.png', 'icon-384.png',
        'icon-512.png', 'icon-maskable-192.png', 'icon-maskable-512.png',
        'offline.html',
      ],
    }),
  ],

  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },

  // Dev server (local only)
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api':     { target: 'http://127.0.0.1:5000', changeOrigin: true },
      '/uploads': { target: 'http://127.0.0.1:5000', changeOrigin: true },
    },
  },

  build: {
    outDir:    'dist',
    sourcemap: false,
    minify:    'esbuild',
    target:    'es2020',

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-dom') || id.includes('react/'))
            return 'react';
          if (id.includes('react-router'))
            return 'router';
          if (id.includes('@tanstack'))
            return 'query';
          if (id.includes('recharts') || id.includes('d3-'))
            return 'charts';
          if (id.includes('socket.io-client') || id.includes('engine.io'))
            return 'socket';
          if (id.includes('node_modules'))
            return 'vendor';
        },
        entryFileNames:  'assets/[name]-[hash].js',
        chunkFileNames:  'assets/[name]-[hash].js',
        assetFileNames:  'assets/[name]-[hash].[ext]',
      },
    },

    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    reportCompressedSize: false,
  },
});
