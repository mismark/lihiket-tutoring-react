import { defineConfig, splitVendorChunkPlugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(), // auto-splits vendor chunks
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
    sourcemap: false,      // no source maps in production
    minify:    'esbuild',  // fastest minifier
    target:    'es2020',   // modern browsers only

    // Split chunks so browsers cache vendor code separately from app code
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core
          if (id.includes('react-dom') || id.includes('react/'))
            return 'react';
          // Router
          if (id.includes('react-router'))
            return 'router';
          // React Query
          if (id.includes('@tanstack'))
            return 'query';
          // Charts (large — separate so it's cached independently)
          if (id.includes('recharts') || id.includes('d3-'))
            return 'charts';
          // Socket.IO client
          if (id.includes('socket.io-client') || id.includes('engine.io'))
            return 'socket';
          // All other node_modules
          if (id.includes('node_modules'))
            return 'vendor';
        },
        // Content-hash filenames for long-term caching
        entryFileNames:  'assets/[name]-[hash].js',
        chunkFileNames:  'assets/[name]-[hash].js',
        assetFileNames:  'assets/[name]-[hash].[ext]',
      },
    },

    // Warn at 1 MB (informational only)
    chunkSizeWarningLimit: 1000,

    // CSS code splitting
    cssCodeSplit: true,

    // Pre-compress assets for Nginx gzip_static
    // (requires vite-plugin-compression — skip if not installed)
    reportCompressedSize: false, // speeds up build
  },
});
