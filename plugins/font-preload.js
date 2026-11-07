// Preloads the résumé's text fonts so they arrive with the stylesheet instead of after first paint. Without this,
// mobile Lighthouse saw Geist swap in late and re-wrap the entries (CLS up to ~0.12). Only the build has hashed
// font files to point at, so dev is left alone. Archivo (90 KB, the name only) is not preloaded: one line, no reflow.
const PRELOADS = {
  'resume/index.html': [/^assets\/geist-latin-400-normal-/, /^assets\/geist-latin-600-normal-/, /^assets\/geist-mono-latin-400-normal-/, /^assets\/geist-mono-latin-500-normal-/],
};

export default function fontPreload(){
  return {
    name: 'font-preload',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx){
        const page = ctx.filename.replace(/\\/g, '/').split('/').slice(-2).join('/');
        const wanted = PRELOADS[page];
        if (!wanted || !ctx.bundle) return html;
        const files = Object.keys(ctx.bundle).filter(f => f.endsWith('.woff2') && wanted.some(re => re.test(f)));
        if (files.length !== wanted.length) throw new Error(`font-preload: expected ${wanted.length} fonts for ${page}, found ${files.length}`);
        return {html, tags: files.map(f => ({tag: 'link', injectTo: 'head-prepend', attrs: {rel: 'preload', href: `/${f}`, as: 'font', type: 'font/woff2', crossorigin: ''}}))};
      },
    },
  };
}
