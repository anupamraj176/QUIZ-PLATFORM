import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname, './'),
  build: {
    outDir: path.resolve(__dirname, './dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/user': 'http://localhost:3000',
      '/question': 'http://localhost:3000',
      '/admin': 'http://localhost:3000',
      '/time': 'http://localhost:3000',
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
    }
  }
});
