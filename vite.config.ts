import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => {
  return {
    // GitHub Pages serves this project from /project-chroma/, while local dev
    // and other hosts should continue to use the root path.
    base: command === 'build' ? '/project-chroma/' : '/',
    server: {
      allowedHosts: ['.loca.lt'],
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
