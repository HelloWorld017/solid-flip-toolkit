import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import { resolve } from 'node:path';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      'solid-flip-toolkit': resolve(__dirname, './src/index.ts'),
    },
  },
});
