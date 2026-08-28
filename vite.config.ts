import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sites } from '@openai/sites-vite-plugin';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS === 'true' ? '/TTAM/' : '/',
  plugins: [react(), sites()],
  build: {
    cssMinify: 'esbuild',
  },
  resolve: {
    alias: {
      '@': '/src',
      roughjs: fileURLToPath(new URL('./node_modules/roughjs/bundled/rough.esm.js', import.meta.url)),
    },
  },
  server: {
    warmup: {
      clientFiles: ['./src/main.tsx'],
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@byted-keystone/react', '@fe-infra/keystone-icons-react', '@fe-infra/chart-react'],
  },
});
