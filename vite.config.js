import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Set BASE_PATH when hosting under a subpath (e.g. GitHub Pages project
  // sites use `/<repo>/`); custom domains and user pages use `/`.
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    environmentOptions: {
      jsdom: { url: 'http://localhost' },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
});
