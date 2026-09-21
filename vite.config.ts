import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: process.env.DEPLOY_TARGET === 'github' ? '/kotoba-daily/' : '/',
  plugins: [react()],
  server: {
    port: 9080,
  },
  preview: {
    port: 9080,
  },
});
