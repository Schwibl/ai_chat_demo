import { defineConfig } from 'vite';
import path from 'path';
import { chatMockPlugin } from './vite/chat-mock-plugin';

export default defineConfig({
  root: 'frontend',
  plugins: [chatMockPlugin()],
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  server: { port: 5174 },
});
