import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the build works from /<repo>/ on GitHub Pages
  // (and from any other subpath or a custom domain).
  base: './',
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1400,
  },
  server: { port: 5173 },
});
