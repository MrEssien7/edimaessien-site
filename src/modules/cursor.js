import {$, reduce} from '../lib/env.js';

/* ---------- Cursor ---------- */
export function initCursor(){
  const cur = $('#cursor');
  if (!matchMedia('(pointer:fine)').matches || reduce) return;
  let mx = -100, my = -100, cx = -100, cy = -100;
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
  (function loop(){ cx += (mx - cx) * .18; cy += (my - cy) * .18; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
  document.querySelectorAll('[data-cursor]').forEach(el => {
    el.addEventListener('pointerenter', () => cur.classList.add('view'));
    el.addEventListener('pointerleave', () => cur.classList.remove('view'));
  });
}
