import * as T from 'three';
import {reduce, visible} from '../lib/env.js';
import {pearl, makeRenderer, fit} from '../lib/gl.js';

/* ---------- Skills mini scenes ---------- */
function scene(canvas, kind){
  const MAT = pearl();
  const r = makeRenderer(canvas), sc = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, .1, 100);
  cam.position.set(0, 2.2, 11); cam.lookAt(0, 0, 0);
  const root = new T.Group(); sc.add(root);
  const anim = [];
  if (kind === 'bars'){
    const bg = new T.BoxGeometry(.62, 1, .62);
    for (let i = 0; i < 5; i++) for (let j = 0; j < 4; j++){
      const m = new T.Mesh(bg, MAT); m.position.set((i - 2) * .82, 0, (j - 1.5) * .82); root.add(m);
      anim.push(t => { const h = .4 + 1.6 * (.5 + .5 * Math.sin(t * 1.4 + i * .7 + j * 1.1)); m.scale.y = h; m.position.y = h / 2 - 1; });
    }
    root.rotation.x = .1;
  }
  if (kind === 'net'){
    const ico = new T.IcosahedronGeometry(2.3, 1);
    const pos = ico.attributes.position, seen = new Map(), pts = [];
    for (let i = 0; i < pos.count; i++){ const v = new T.Vector3().fromBufferAttribute(pos, i); const k = v.toArray().map(n => n.toFixed(3)).join(); if (!seen.has(k)){ seen.set(k, pts.length); pts.push(v); } }
    const sg = new T.SphereGeometry(.13, 20, 20);
    pts.forEach(p => { const m = new T.Mesh(sg, MAT); m.position.copy(p); root.add(m); });
    const edges = new T.EdgesGeometry(ico);
    root.add(new T.LineSegments(edges, new T.LineBasicMaterial({color: 0xB5DECC, transparent: true, opacity: .55})));
    const core = new T.Mesh(new T.IcosahedronGeometry(.7, 2), MAT); root.add(core);
  }
  if (kind === 'stack'){
    const rr = (w, h, r) => { const s = new T.Shape(); s.moveTo(-w/2 + r, -h/2); s.lineTo(w/2 - r, -h/2); s.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r); s.lineTo(w/2, h/2 - r); s.quadraticCurveTo(w/2, h/2, w/2 - r, h/2); s.lineTo(-w/2 + r, h/2); s.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r); s.lineTo(-w/2, -h/2 + r); s.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2); return s; };
    const g = new T.ExtrudeGeometry(rr(3, 3, .5), {depth: .38, bevelEnabled: true, bevelThickness: .08, bevelSize: .08, bevelSegments: 6});
    g.center(); g.rotateX(-Math.PI / 2);
    for (let i = 0; i < 3; i++){ const m = new T.Mesh(g, MAT); root.add(m); anim.push(t => { const sp = .7 + .35 * (.5 + .5 * Math.sin(t * 1.2)); m.position.y = (i - 1) * sp; m.rotation.y = i * .12 * Math.sin(t * .6); }); }
    root.rotation.x = .35;
  }
  const hover = {v: 0};
  const card = canvas.closest('.skill');
  card.addEventListener('pointerenter', () => hover.v = 1); card.addEventListener('pointerleave', () => hover.v = 0);
  let spd = 0, run = false, t = 0, last = performance.now();
  const resize = () => { fit(r, cam, canvas); if (reduce) run = true; }; resize(); addEventListener('resize', resize);
  visible(canvas, v => { run = v; last = performance.now(); });
  (function tick(now){
    requestAnimationFrame(tick);
    // Reduced motion: draw one still frame whenever it comes into view or resizes, then stop.
    if (!run) return;
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    spd += ((hover.v ? 1.9 : .5) - spd) * .05;
    if (!reduce){ t += dt * spd * 1.4; root.rotation.y += dt * spd * .5; }
    anim.forEach(f => f(reduce ? 1 : t));
    r.render(sc, cam);
    if (reduce) run = false;
  })(last);
}

export function initSkills(){
  document.querySelectorAll('[data-scene]').forEach(c => scene(c, c.dataset.scene));
}
