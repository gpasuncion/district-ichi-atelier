import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, 'assets'),
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/index.jsx'),
      output: {
        entryFileNames: 'react-lookbook.bundle.js',
        assetFileNames: 'react-lookbook.[ext]',
      },
    },
  },
});