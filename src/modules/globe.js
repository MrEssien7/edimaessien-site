import {$, reduce, visible} from '../lib/env.js';

/* ---------- Globe ---------- */
export function initGlobe(){
  const cv = $('#globe'), x = cv.getContext('2d');
  let s, dpr, run = false;
  function size(){ dpr = Math.min(2, devicePixelRatio || 1); s = cv.clientWidth; cv.width = cv.height = s * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); run = run || reduce; }
  size(); addEventListener('resize', size); visible(cv, v => run = v);
  const PTS = []; for (let la = -84; la <= 84; la += 6){ const n = Math.max(1, Math.round(60 * Math.cos(la * Math.PI / 180))); for (let k = 0; k < n; k++) PTS.push([la, k * 360 / n - 180]); }
  const home = [42.31, -83.04];
  const t0 = performance.now();
  (function tick(now){
    requestAnimationFrame(tick);
    // Paused off screen; with reduced motion, one still frame per view or resize.
    if (!run) return;
    if (reduce) run = false;
    const t = reduce ? 0 : (now - t0) / 1000;
    const R = s * .46, c = s / 2, rot = (-home[1] - 0) * Math.PI / 180 + Math.sin(t * .25) * .5, tilt = 0.45;
    x.clearRect(0, 0, s, s);
    const proj = ([la, lo]) => { const p = la * Math.PI / 180, l = lo * Math.PI / 180 + rot; let X = Math.cos(p) * Math.sin(l), Y = Math.sin(p), Z = Math.cos(p) * Math.cos(l); const Y2 = Y * Math.cos(tilt) - Z * Math.sin(tilt), Z2 = Y * Math.sin(tilt) + Z * Math.cos(tilt); return [c + X * R, c - Y2 * R, Z2]; };
    x.strokeStyle = 'rgba(255,255,255,.08)'; x.beginPath(); x.arc(c, c, R, 0, Math.PI * 2); x.stroke();
    for (const p of PTS){ const [px, py, z] = proj(p); if (z < 0) continue; x.fillStyle = `rgba(167,212,228,${.14 + z * .55})`; x.fillRect(px - .9, py - .9, 1.8, 1.8); }
    const [hx, hy, hz] = proj(home);
    if (hz > 0){ const pr = 6 + 10 * ((t * .8) % 1); x.strokeStyle = `rgba(150,209,170,${1 - (t * .8) % 1})`; x.beginPath(); x.arc(hx, hy, pr, 0, Math.PI * 2); x.stroke(); x.fillStyle = '#96D1AA'; x.beginPath(); x.arc(hx, hy, 4, 0, Math.PI * 2); x.fill(); }
  })(t0);
}
