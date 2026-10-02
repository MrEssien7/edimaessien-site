import {$, reduce, visible} from '../../lib/env.js';

/* ---------- Water: real site locations + real DO series ---------- */
export function initWater(){
  const SITES = [[42.2741,-82.7138],[42.1275,-83.0379],[42.1092,-83.0821],[42.0107,-82.7809],[42.027,-82.8241],[42.0874,-83.0825],[42.2934,-82.6867],[42.2678,-82.6334],[42.0427,-82.4998],[42.2967,-82.7118],[42.3199,-82.9256],[42.3277,-82.9262],[42.3025,-83.0789],[42.3137,-82.8437],[42.1691,-83.0982],[42.1846,-83.0786],[42.1469,-83.1021],[42.2377,-83.1054],[42.2449,-83.1005],[42.2448,-83.0706]];
  const DO = [108.5,66.8,67.7,105.85,14.9,76,62.6], LAB = ['Apr','May','Jun','Jul','Aug','Sep','Oct'];
  const svg = $('#waterSvg');
  function draw(){
    const w = svg.clientWidth || 600, h = svg.clientHeight || 500;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    const lat0 = 41.98, lat1 = 42.36, lon0 = -83.15, lon1 = -82.46;
    const mx = w < 500 ? 24 : 40, mTop = 60, mapH = h * (w < 500 ? .34 : .46);
    const k = Math.min((w - 2 * mx) / (lon1 - lon0) / Math.cos(42.2 * Math.PI / 180), mapH / (lat1 - lat0));
    const ox = (w - (lon1 - lon0) * Math.cos(42.2 * Math.PI / 180) * k) / 2;
    const px = lon => ox + (lon - lon0) * Math.cos(42.2 * Math.PI / 180) * k, py = lat => mTop + (lat1 - lat) * k;
    let grid = '';
    for (let i = 0; i <= 8; i++){ const gx = mx + i * (w - 2 * mx) / 8; grid += `<line x1="${gx}" x2="${gx}" y1="${mTop - 10}" y2="${mTop + mapH + 10}" stroke="rgba(255,255,255,.05)"/>`; }
    for (let i = 0; i <= 4; i++){ const gy = mTop + i * mapH / 4; grid += `<line x1="${mx}" x2="${w - mx}" y1="${gy}" y2="${gy}" stroke="rgba(255,255,255,.05)"/>`; }
    const dots = SITES.map((s, i) => `<g class="site" style="--d:${i * .14}s"><circle cx="${px(s[1])}" cy="${py(s[0])}" r="10" fill="rgba(181,222,204,.16)"><animate attributeName="r" values="4;16;4" dur="3s" begin="${i * .14}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0;1" dur="3s" begin="${i * .14}s" repeatCount="indefinite"/></circle><circle cx="${px(s[1])}" cy="${py(s[0])}" r="3.4" fill="#B5DECC"/></g>`).join('');
    const cTop = mTop + mapH + 46, cH = Math.max(60, h - cTop - (w < 500 ? 150 : 115)), cx0 = mx, cx1 = w - mx;
    const X = i => cx0 + i * (cx1 - cx0) / (DO.length - 1), Y = v => cTop + (1 - v / 120) * cH;
    const d = DO.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
    svg.innerHTML = `${grid}
      <text x="${mx}" y="${mTop - 22}" fill="rgba(255,255,255,.55)" font-family="Geist Mono, monospace" font-size="11" letter-spacing=".06em">20 COMMUNITY SCIENCE SITES · 2025</text>
      ${dots}
      <line x1="${cx0}" x2="${cx1}" y1="${Y(47)}" y2="${Y(47)}" stroke="#F9C1CE" stroke-dasharray="4 5"/>
      <text x="${cx0}" y="${Y(47) - 6}" fill="#F9C1CE" font-family="Geist Mono, monospace" font-size="10">ONTARIO WARM-WATER MIN 47%</text>
      <path id="doPath" d="${d}" fill="none" stroke="#fff" stroke-width="2"/>
      ${DO.map((v, i) => `<circle cx="${X(i)}" cy="${Y(v)}" r="${v < 47 ? 5 : 3.5}" fill="${v < 47 ? '#F9C1CE' : '#12354e'}" stroke="${v < 47 ? '#F9C1CE' : '#fff'}" stroke-width="1.5"/>`).join('')}
      ${LAB.map((l, i) => `<text x="${X(i)}" y="${cTop + cH + 18}" fill="rgba(255,255,255,.45)" font-family="Geist Mono, monospace" font-size="10" text-anchor="middle">${l}</text>`).join('')}
      <text x="${cx1}" y="${cTop - 8}" fill="rgba(255,255,255,.55)" font-family="Geist Mono, monospace" font-size="10" text-anchor="end">DISSOLVED O₂ · LITTLE RIVER</text>`;
    const p = $('#doPath'), L = p.getTotalLength();
    if (!reduce){ p.style.strokeDasharray = L; p.style.strokeDashoffset = L; visible(p, v => { if (v){ p.style.transition = 'stroke-dashoffset 2.2s cubic-bezier(.22,1,.36,1)'; p.style.strokeDashoffset = 0; } }); }
  }
  // The site pulses are SMIL; pause them off screen and keep them still for reduced motion.
  visible(svg, v => v && !reduce ? svg.unpauseAnimations() : svg.pauseAnimations());
  draw(); let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(draw, 200); });
}
