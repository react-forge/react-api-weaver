import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "bundle-report.html",
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      module: false,
    },
  },
  optimizeDeps: {
    exclude: ['react-api-weaver'],
  },
});

