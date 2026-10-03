// The hero's Gentilis Bold "E" as an inline SVG path, so the serif E looks identical everywhere
// (system serif fonts differ: Georgia on Windows/macOS, DejaVu on Netlify's Linux build image).
import {EFONT} from '../src/lib/e-glyph.js';

export function eSvg(cls = ''){
  const g = EFONT.glyphs.E, top = 855;
  const t = g.o.trim().split(/\s+/);
  const n = () => +t[i++];
  let i = 0, d = '';
  const pt = () => { const x = n(), y = top - n(); return `${x} ${y}`; };
  while (i < t.length){
    const c = t[i++];
    // typeface.js quadratic curves list the end point first, then the control point.
    if (c === 'm') d += `M${pt()}`;
    else if (c === 'l') d += `L${pt()}`;
    else if (c === 'q'){ const end = pt(), ctrl = pt(); d += `Q${ctrl} ${end}`; }
  }
  return `<svg class="${cls}" viewBox="29 0 669 855" aria-hidden="true" focusable="false"><path d="${d}Z" fill="currentColor"/></svg>`;
}
