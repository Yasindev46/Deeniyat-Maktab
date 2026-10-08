import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:3001';

  return {
    plugins: [react()],
    base: '/Deeniyat-Maktab/',
    server: {
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
  };
});
