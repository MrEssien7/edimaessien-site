import {$, reduce, visible} from '../../lib/env.js';

/* ---------- Systems network canvas ---------- */
export function initSystems(){
  const cv = $('#sysCv'), x = cv.getContext('2d');
  const N = ["Raiser's Edge NXT", 'Salesforce', 'Constant Contact', 'Constant Contact', 'Qualtrics', 'PoliTraQ', 'Agility PR'];
  // The diagram fills the space between the corner labels and the caption (.meta), so no node sits under the text.
  // Sizes come from a ResizeObserver (first layout, resize, web fonts arriving), never per frame, so drawing
  // never forces a layout.
  const meta = cv.closest('.card')?.querySelector('.meta');
  let w, h, dpr, metaH = 140, run = false;
  function size(){ dpr = Math.min(2, devicePixelRatio || 1); w = cv.clientWidth; h = cv.clientHeight; metaH = meta?.offsetHeight || 140; cv.width = w * dpr; cv.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); run = run || reduce; }
  const ro = new ResizeObserver(size); ro.observe(cv); if (meta) ro.observe(meta);
  visible(cv, v => run = v);
  function nodes(t){
    const top = 56, bottom = h - metaH + 20, cy = (top + bottom) / 2;
    const cx = w / 2, rx = Math.min(w * .36, 260), ry = Math.max(40, Math.min((bottom - top) / 2 - 18, 170));
    return N.map((n, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / N.length + t * .05; return {n, x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry}; }).concat([{n: 'One constituent', x: cx, y: cy, hub: true}]);
  }
  const t0 = performance.now();
  let frame = 0;
  (function tick(now){
    requestAnimationFrame(tick);
    // Paused off screen; with reduced motion, one still frame per view or resize.
    if (!run || !w) return;
    // A slow drift doesn't need 60 fps: drawing every other frame halves its main-thread cost.
    if (!reduce && (frame++ & 1)) return;
    if (reduce) run = false;
    const t = reduce ? 0 : (now - t0) / 1000;
    x.clearRect(0, 0, w, h);
    const ns = nodes(t), hub = ns[ns.length - 1];
    ns.slice(0, -1).forEach((n, i) => {
      x.strokeStyle = 'rgba(167,212,228,.3)'; x.lineWidth = 1;
      x.beginPath(); x.moveTo(n.x, n.y); x.lineTo(hub.x, hub.y); x.stroke();
      const p = ((t * .35 + i / N.length) % 1);
      const px = n.x + (hub.x - n.x) * p, py = n.y + (hub.y - n.y) * p;
      x.fillStyle = 'rgba(181,222,204,' + (1 - p) + ')'; x.beginPath(); x.arc(px, py, 3, 0, Math.PI * 2); x.fill();
    });
    ns.forEach(n => {
      x.font = (n.hub ? '600 13px ' : '500 12px ') + 'Geist, system-ui, sans-serif';
      const tw = x.measureText(n.n).width + 24, th = 30;
      x.fillStyle = n.hub ? '#96D1AA' : 'rgba(255,255,255,.07)';
      x.strokeStyle = n.hub ? '#96D1AA' : 'rgba(255,255,255,.18)';
      const rx = n.x - tw / 2, ry = n.y - th / 2;
      x.beginPath(); if (x.roundRect) x.roundRect(rx, ry, tw, th, 15); else x.rect(rx, ry, tw, th); x.fill(); x.stroke();
      x.fillStyle = n.hub ? '#12354E' : '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(n.n, n.x, n.y + .5);
    });
  })(t0);
}
