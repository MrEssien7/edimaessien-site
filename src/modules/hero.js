import * as T from 'three';
import {Font} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js';
import {gsap} from 'gsap';
import {$, reduce, visible} from '../lib/env.js';
import {pearl, makeRenderer, fit} from '../lib/gl.js';
import {EFONT} from '../lib/e-glyph.js';

/* ---------- Hero: porcelain E ---------- */
export function initHero(){
  const cv = $('#heroGL'), r = makeRenderer(cv), sc = new T.Scene(), cam = new T.PerspectiveCamera(32, 1, .1, 100);
  cam.position.set(0, 0, 14);
  const geo = new TextGeometry('E', {font: new Font(EFONT), size: 4.4, depth: 1.05, curveSegments: 18, bevelEnabled: true, bevelThickness: .22, bevelSize: .12, bevelSegments: 14});
  geo.center();
  const heroE = new T.Mesh(geo, pearl());
  const grp = new T.Group(); grp.add(heroE); sc.add(grp);
  const tgt = {x: 0, y: 0};
  addEventListener('pointermove', e => { tgt.x = (e.clientX / innerWidth - .5); tgt.y = (e.clientY / innerHeight - .5); });
  const scrollSpin = {v: 0};
  if (!reduce) gsap.to(scrollSpin, {v: 1, ease: 'none', scrollTrigger: {trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true}});
  function layout(){
    fit(r, cam, cv);
    const mobile = cv.clientWidth < 760;
    grp.position.set(mobile ? .6 : 4.1, mobile ? 2.5 : .2, 0);
    const k = mobile ? .5 : .92; grp.scale.set(k, k, k);
  }
  layout(); addEventListener('resize', layout);
  let run = true; const t0 = performance.now();
  visible(cv, v => run = v);
  (function tick(now){
    requestAnimationFrame(tick);
    if (!run) return;
    const t = (now - t0) / 1000;
    if (!reduce){
      heroE.rotation.y += ((-.45 + tgt.x * .9 + Math.sin(t * .5) * .18 + scrollSpin.v * 2.2) - heroE.rotation.y) * .06;
      heroE.rotation.x += ((.12 + tgt.y * .5 + scrollSpin.v * .4) - heroE.rotation.x) * .06;
      grp.position.y += ((cv.clientWidth < 760 ? 2.6 : .2) + Math.sin(t * .9) * .12 - grp.position.y) * .05;
    } else { heroE.rotation.set(.12, -.45, 0); }
    r.render(sc, cam);
  })(t0);
}
