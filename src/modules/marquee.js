import {$} from '../lib/env.js';

/* ---------- Marquee ---------- */
const TOOLS1 = ['Python','Oracle SQL','Excel','Power Query','Salesforce',"Raiser's Edge NXT",'Qualtrics','Constant Contact'];
const TOOLS2 = ['React','Vite','Claude Code','Git','GitHub Actions','draw.io','Word','PowerPoint'];
const fill = (el, arr) => { const html = arr.map(t => `<span><i></i>${t}</span>`).join(''); el.innerHTML = html + html; };

export function initMarquee(){
  fill($('#mq1'), TOOLS1); fill($('#mq2'), TOOLS2);
  // CSS animation; pause it while the panel is off screen.
  const mq = $('.marquee');
  new IntersectionObserver(([e]) => mq.querySelectorAll('.track-m').forEach(t => t.style.animationPlayState = e.isIntersecting ? '' : 'paused')).observe(mq);
}
