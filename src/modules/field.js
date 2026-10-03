import {reduce} from '../lib/env.js';

/* ---------- In the field: detail dialog with a swipeable gallery ---------- */
export function initField(lenis){
  const dialog = document.getElementById('fieldDialog');
  const body = document.getElementById('fdBody');
  if (!dialog || !document.querySelector('[data-moment]')) return;
  let opener = null, cleanup = () => {};

  function open(btn){
    const tpl = document.getElementById(`moment-${btn.dataset.moment}`);
    if (!tpl) return;
    opener = btn;
    body.replaceChildren(tpl.content.cloneNode(true));
    cleanup = gallery(body);
    lenis?.stop();
    document.documentElement.style.overflow = 'hidden';
    dialog.showModal();
    body.querySelector('.fd-track')?.scrollTo({left: 0});
  }

  // Esc closes natively (the dialog fires "close"); the button and a click on the backdrop close too.
  document.getElementById('fdClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    cleanup(); body.replaceChildren();
    document.documentElement.style.overflow = '';
    lenis?.start();
    opener?.focus({preventScroll: true});
  });
  document.querySelectorAll('[data-moment]').forEach(btn => btn.addEventListener('click', () => open(btn)));
}

function gallery(root){
  const track = root.querySelector('.fd-track');
  const slides = [...track.children];
  const prev = root.querySelector('.fd-prev'), next = root.querySelector('.fd-next'), count = root.querySelector('.fd-count');
  const videos = [...track.querySelectorAll('video')];
  let index = 0;

  const go = i => {
    index = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({left: slides[index].offsetLeft, behavior: reduce ? 'auto' : 'smooth'});
  };
  function sync(){
    if (count) count.textContent = `${index + 1} / ${slides.length}`;
    if (prev) prev.disabled = index === 0;
    if (next) next.disabled = index === slides.length - 1;
    slides.forEach((s, i) => s.setAttribute('aria-hidden', i !== index));
    // Videos only load and play while their slide is showing; with reduced motion they stay paused with controls.
    videos.forEach(v => {
      const shown = v.closest('.slide') === slides[index];
      if (reduce){ v.controls = true; if (!shown) v.pause(); return; }
      if (shown){ v.preload = 'auto'; v.play().catch(() => { v.controls = true; }); } else v.pause();
    });
  }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && e.intersectionRatio > .6){ index = slides.indexOf(e.target); sync(); }
  }), {root: track, threshold: [.6]});
  slides.forEach(s => io.observe(s));

  prev?.addEventListener('click', () => go(index - 1));
  next?.addEventListener('click', () => go(index + 1));
  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight'){ e.preventDefault(); go(index + 1); }
    if (e.key === 'ArrowLeft'){ e.preventDefault(); go(index - 1); }
  });
  sync();
  return () => { io.disconnect(); videos.forEach(v => v.pause()); };
}
