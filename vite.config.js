import {defineConfig} from 'vite';
import fieldSection from './plugins/field-section.js';

export default defineConfig({
  plugins: [fieldSection()],
  build: {
    // Keep font files as separate cacheable files instead of inlining small subsets as data URIs.
    assetsInlineLimit: (file) => /\.(woff2?)$/.test(file) ? false : undefined,
  },
});
