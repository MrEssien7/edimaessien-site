# edimaessien.dev

Portfolio site for Edima Essien. Vite, vanilla JavaScript, three.js, GSAP + ScrollTrigger and Lenis.

```sh
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # serve dist/ locally
```

Live at https://edimaessien.dev.

## Hosting

- **Netlify** builds from `netlify.toml`. Every push to `main` goes live, and every other branch gets a preview at `<branch>--edimaessien.netlify.app`.
- **Domain:** registered at Porkbun, with DNS on Netlify (nameservers `dns1`–`dns4.p06.nsone.net`). `edimaessien.dev` is the primary domain, and `www` and `http://` redirect to it.
- **HTTPS:** a Let's Encrypt certificate that Netlify provisions and renews automatically. `.dev` is HSTS-preloaded, so HTTPS is required.


Colours from Sanzo Wada's *A Dictionary of Color Combinations*, No. 167 and 202.
