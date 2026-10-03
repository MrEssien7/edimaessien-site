import {defineConfig} from 'vite';
import fieldSection from './plugins/field-section.js';

export default defineConfig({
  plugins: [fieldSection()],
  build: {
    // Pages: the site, the printable résumé (served at /resume/) and the 404 page Netlify serves for missing paths.
    rollupOptions: {input: {main: 'index.html', resume: 'resume/index.html', notfound: '404.html'}},
    // Keep font files as separate cacheable files instead of inlining small subsets as data URIs.
    assetsInlineLimit: (file) => /\.(woff2?)$/.test(file) ? false : undefined,
  },
});
