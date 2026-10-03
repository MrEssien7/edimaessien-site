// The hero's Gentilis Bold "E" as an inline SVG path, so the serif E looks identical everywhere
// (system serif fonts differ: Georgia on Windows/macOS, DejaVu on Linux, Noto Serif on Android).
import {EFONT} from '../src/lib/e-glyph.js';

export function ePath(){
  const g = EFONT.glyphs.E, top = 855;
  const t = g.o.trim().split(/\s+/);
  let i = 0, d = '';
  const pt = () => { const x = +t[i++], y = top - +t[i++]; return `${x} ${y}`; };
  while (i < t.length){
    const c = t[i++];
    // typeface.js quadratic curves list the end point first, then the control point.
    if (c === 'm') d += `M${pt()}`;
    else if (c === 'l') d += `L${pt()}`;
    else if (c === 'q'){ const end = pt(), ctrl = pt(); d += `Q${ctrl} ${end}`; }
  }
  return d + 'Z';
}

// outline: stroke only (the no-WebGL hero fallback). Otherwise filled with currentColor.
export function eSvg(cls = '', {outline = false} = {}){
  const paint = outline ? 'fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"' : 'fill="currentColor"';
  return `<svg class="${cls}" viewBox="29 0 669 855" aria-hidden="true" focusable="false"><path d="${ePath()}" ${paint}/></svg>`;
}
