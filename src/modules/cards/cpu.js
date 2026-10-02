import {gsap} from 'gsap';
import {$, reduce, visible} from '../../lib/env.js';

/* ---------- Round Robin gantt ---------- */
export function initCpu(){
  const JOBS = [['P1',5,'#A7D4E4'],['P2',3,'#B5DECC'],['P3',4,'#96D1AA'],['P4',2,'#C2AE93']], Q = 2;
  const tl = [], rem = JOBS.map(j => j[1]); let t = 0, any = true;
  while (any){ any = false; JOBS.forEach((j, i) => { if (rem[i] > 0){ const d = Math.min(Q, rem[i]); tl.push({i, s: t, d}); t += d; rem[i] -= d; any = true; } }); }
  const g = $('#gantt');
  g.innerHTML = JOBS.map(j => `<div class="lane"><span>${j[0]}</span><div class="track"></div></div>`).join('');
  const tracks = [...g.querySelectorAll('.track')];
  const blks = tl.map(b => { const e = document.createElement('div'); e.className = 'blk'; e.style.left = (b.s / t * 100) + '%'; e.style.width = (b.d / t * 100) + '%'; e.style.background = JOBS[b.i][2]; tracks[b.i].appendChild(e); return e; });
  if (reduce){ blks.forEach(b => b.style.transform = 'scaleX(1)'); return; }
  const tw = gsap.timeline({repeat: -1, repeatDelay: .8, paused: true});
  tl.forEach((b, k) => tw.to(blks[k], {scaleX: 1, duration: b.d * .3, ease: 'none'}, b.s * .3));
  tw.to(blks, {opacity: 0, duration: .4}, '+=1').set(blks, {scaleX: 0, opacity: 1});
  visible(g, v => v ? tw.play() : tw.pause());
}
