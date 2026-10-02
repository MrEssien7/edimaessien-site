import {$, reduce} from '../lib/env.js';

/* ---------- Signature: drawn like a pen stroke when it scrolls into view, redrawn on hover ---------- */
export function initSignature(){
  const sig = $('#sig'); if (!sig) return;
  const strokes = [...sig.querySelectorAll('.main path, .nib path, .dot')];
  const lens = strokes.map(p => p.getTotalLength());
  // timing: E slow and deliberate, scrawl fast, underline and dot last
  const plan = p => p.closest('.nib') ? null : p.classList.contains('u') ? [1.9, .55] : p.classList.contains('dot') ? [2.45, .12] : p === sig.querySelector('.main path') ? [0, 1.05] : [1.0, .95];
  function draw(){
    if (reduce) return;
    strokes.forEach((p, i) => {
      const L = lens[i]; let pl = plan(p);
      if (!pl){ const k = [...sig.querySelectorAll('.nib path')].indexOf(p); pl = k === 0 ? [0, 1.05] : [1.0, .95]; }
      p.style.transition = 'none'; p.style.strokeDasharray = L + 1; p.style.strokeDashoffset = L + 1;
      p.getBoundingClientRect();
      p.style.transition = `stroke-dashoffset ${pl[1]}s cubic-bezier(.45,.05,.35,1) ${pl[0]}s`;
      p.style.strokeDashoffset = 0;
    });
  }
  let seen = false;
  new IntersectionObserver(([e]) => { if (e.isIntersecting && !seen){ seen = true; draw(); } }, {threshold: .5}).observe(sig);
  let last = 0;
  sig.addEventListener('pointerenter', () => { const n = performance.now(); if (seen && n - last > 3200){ last = n; draw(); } });
}
