import {reduce} from '../lib/env.js';

/* ---------- Drip demo player (present only when a real recording has been added) ---------- */
export function initDemo(lenis){
  const dialog = document.getElementById('demoDialog'), openBtn = document.getElementById('demoOpen');
  if (!dialog || !openBtn) return;
  const video = dialog.querySelector('video');
  openBtn.addEventListener('click', () => {
    lenis?.stop(); document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
    // The visitor asked to watch, so start it; with reduced motion it waits for them to press play.
    if (!reduce){ video.preload = 'auto'; video.play().catch(() => {}); }
  });
  document.getElementById('demoClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    video.pause();
    document.documentElement.style.overflow = ''; lenis?.start();
    openBtn.focus({preventScroll: true});
  });
}
