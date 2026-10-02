import {$, reduce, visible} from '../../lib/env.js';

/* ---------- Drip island demo loop ---------- */
export function initDrip(){
  const isl = $('#island'), sub = $('#islSub'), chip = $('#islChip'), timer = $('#islTimer'), allow = $('#islAllow'), bar = $('#dripBar');
  const steps = [
    ['work', 'Read · forecast.ts', 'Working', false, 1400],
    ['work', 'Edit · forecast.ts', 'Working', false, 1400],
    ['ask', 'Needs your OK', 'Needs you', true, 2600],
    ['work', 'Run · npm test', 'Working', false, 1600],
    ['done', 'Done in 0:42 · 4 steps', 'Done', false, 2200],
  ];
  if (reduce){ isl.dataset.s = 'ask'; isl.classList.add('big'); sub.textContent = 'Needs your OK'; chip.textContent = 'Needs you'; return; }
  let k = 0, elapsed = 0, run = false;
  const total = steps.reduce((a, s) => a + s[4], 0);
  visible(isl, v => { if (v && !run){ run = true; step(); } else if (!v) run = false; });
  function step(){
    if (!run) return;
    const [s, txt, c, big, dur] = steps[k];
    isl.dataset.s = s; sub.textContent = txt; chip.textContent = c; isl.classList.toggle('big', big);
    if (s === 'ask'){
      timer.style.transition = 'none'; timer.style.transform = 'scaleX(1)';
      requestAnimationFrame(() => { timer.style.transition = `transform ${dur}ms linear`; timer.style.transform = 'scaleX(.55)'; });
      setTimeout(() => allow.classList.add('press'), dur - 500);
      setTimeout(() => allow.classList.remove('press'), dur - 300);
    }
    bar.style.transition = `width ${dur}ms linear`; elapsed += dur; bar.style.width = (elapsed / total * 100) + '%';
    k = (k + 1) % steps.length;
    setTimeout(() => { if (k === 0){ elapsed = 0; bar.style.transition = 'none'; bar.style.width = '0'; } step(); }, dur);
  }
}
