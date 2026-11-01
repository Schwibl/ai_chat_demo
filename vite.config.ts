import { defineConfig } from 'vite';
import path from 'path';

// Vite config — frontend/ is the dev root; output goes to repo dist/
export default defineConfig({
  root: 'frontend',
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: {
    port: 5174,
  },
});
