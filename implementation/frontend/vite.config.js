import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path'; 

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')   // ← alias so "@/..." works
    }
  },
  
  server: {
    host: true,           // bind 0.0.0.0 so Traefik can reach it
    allowedHosts: [
      'piggybank.the-chicken-nugget.me'
      // or ".the-chicken-nugget.me" to allow any sub-domain
    ],
    proxy: {
      '/api': {
        target: 'http://192.168.5.15:4000',   // keep API proxy if you use it
        changeOrigin: true                    // for virtual hosted sites
      }
    }
  }
});

