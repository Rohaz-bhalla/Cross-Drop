import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Increases the warning limit slightly (optional, but helps with large libs like Three.js)
    chunkSizeWarningLimit: 1000, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Keep Three.js and React-Three-Fiber in their own chunk (they are huge)
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor';
            }
            // Put other standard libraries (React, Framer Motion, etc.) in a vendor chunk
            return 'vendor';
          }
        },
      },
    },
  },
})