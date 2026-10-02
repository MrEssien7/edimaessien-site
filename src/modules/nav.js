import {$} from '../lib/env.js';

/* ---------- Nav colour over paper vs panels, plus the mobile sheet ---------- */
export function initNav(){
  const nav = $('#nav');
  const darkZones = [$('#hero'), $('#skills')];
  function navTone(){
    const y = 40; let onDark = false;
    for (const z of darkZones){ const r = z.getBoundingClientRect(); if (r.top < y && r.bottom > y) onDark = true; }
    nav.classList.toggle('on-paper', !onDark);
  }
  addEventListener('scroll', navTone, {passive: true}); navTone();
  const sheet = $('#sheet'), mb = $('#menuBtn');
  const setSheet = o => { sheet.classList.toggle('open', o); sheet.setAttribute('aria-hidden', !o); mb.setAttribute('aria-expanded', o); };
  mb.onclick = () => setSheet(true); $('#closeSheet').onclick = () => setSheet(false);
  sheet.querySelectorAll('a').forEach(a => a.onclick = () => setSheet(false));
}
