import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': 'http://localhost:5001',
      '/incidents': 'http://localhost:5001',
      '/stats': 'http://localhost:5001',
      '/organizations': 'http://localhost:5001',
      '/uploads': 'http://localhost:5001',
      '/guidance': 'http://localhost:5001',
    },
  },
});
