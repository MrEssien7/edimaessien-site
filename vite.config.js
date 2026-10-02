import {defineConfig} from 'vite';

export default defineConfig({
  build: {
    // Keep font files as separate cacheable files instead of inlining small subsets as data URIs.
    assetsInlineLimit: (file) => /\.(woff2?)$/.test(file) ? false : undefined,
  },
});
