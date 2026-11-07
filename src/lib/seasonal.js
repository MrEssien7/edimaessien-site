// Seasonal falling particles (falling-leaves) over the whole page: leaves in fall, snow in winter, blossoms in spring.
// The library is a separate chunk loaded after the page's load event, like GoatCounter, so it never touches first paint;
// the animation itself starts a few seconds later, once the page is idle (see the end of run()).
// The footer toggle (#seasonToggle, home page only) remembers the choice for every page; it is hidden when the
// season is disabled or the visitor asks for reduced motion. ?season=fall|winter|spring|summer previews a season.
import '../styles/seasonal.css';

// Tune here. Colors starting with -- are read from the palette tokens in tokens.css. Anything left out
// (speed, wind, sway, rotationSpeed) uses the library's defaults.
export const SEASONS = {
  fall:   {enabled: true,  label: 'Leaves',   shapes: ['maple', 'oak'], colors: ['--ecru', '--amber'], count: 12, size: [12, 22], opacity: 0.85},
  winter: {enabled: true,  label: 'Snow',     shapes: ['oval'], colors: ['#FFFFFF'], size: [3, 6], speed: [0.4, 0.9], rotationSpeed: [-0.2, 0.2], count: 25, opacity: 0.8},
  spring: {enabled: true,  label: 'Blossoms', shapes: ['oval'], colors: ['--flag', '--flag-deep'], size: [8, 14], count: 12},
  summer: {enabled: false, label: 'Summer',   shapes: ['oval'], colors: ['--sea'], size: [6, 10], count: 10},
};

// Fall Sep 22 to Dec 20, Winter Dec 21 to Mar 19, Spring Mar 20 to Jun 20, Summer Jun 21 to Sep 21.
export function seasonFor(date){
  const md = (date.getMonth() + 1) * 100 + date.getDate();
  if (md >= 922 && md <= 1220) return 'fall';
  if (md >= 1221 || md <= 319) return 'winter';
  if (md >= 320 && md <= 620) return 'spring';
  return 'summer';
}

const KEY = 'seasonal-effect';
const read = () => { try { return localStorage.getItem(KEY) !== 'off'; } catch(e){ return true; } };
const save = on => { try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch(e){} };

const forced = new URLSearchParams(location.search).get('season');
const season = forced in SEASONS ? forced : seasonFor(new Date());
const preset = SEASONS[season];

if (preset.enabled){
  const run = () => {
    const root = getComputedStyle(document.documentElement);
    const {enabled, label, colors, ...options} = preset;
    const resolved = colors.map(c => c.startsWith('--') ? root.getPropertyValue(c).trim() : c);
    const html = document.documentElement;
    html.classList.add(`fx-${season}`);
    const toggle = document.getElementById('seasonToggle');
    let on = read();
    let fx = null;

    // The canvas is created on first use, so a visitor who switched it off never downloads the library.
    const show = async () => {
      fx ||= import('falling-leaves').then(({FallingLeaves}) =>
        new FallingLeaves({...options, colors: resolved, zIndex: 70, respectReducedMotion: true, autoStart: false}));
      const leaves = await fx;
      html.classList.remove('fx-off');
      if (on && !document.hidden) leaves.start();
    };
    // stop() freezes the leaves in place, so the canvas is also hidden.
    const hide = () => { html.classList.add('fx-off'); fx?.then(l => l.stop()); };

    document.addEventListener('visibilitychange', () => {
      if (!fx || !on) return;
      fx.then(l => document.hidden ? l.stop() : l.start());
    });

    if (toggle){
      // The GoatCounter event names the action the click performs (e.g. leaves-off), set before the click
      // so it is right whichever click handler, count.js's or this one, runs first.
      const render = () => {
        toggle.textContent = `${label}: ${on ? 'on' : 'off'}`;
        toggle.setAttribute('aria-pressed', String(on));
        toggle.dataset.goatcounterClick = `${label.toLowerCase()}-${on ? 'off' : 'on'}`;
        toggle.dataset.goatcounterTitle = `${label}: turned ${on ? 'off' : 'on'}`;
      };
      toggle.addEventListener('click', () => { on = !on; save(on); on ? show() : hide(); render(); });
      render();
      toggle.hidden = false;
    }
    // Started at the load event, the animation ran alongside the live hero's setup (also after load) and made
    // its long tasks longer: mobile Lighthouse TBT went from ~260 ms to ~850 ms. So it waits for the page to settle.
    if (on){ (window.requestIdleCallback || (f => setTimeout(f, 200)))(() => setTimeout(() => on && show(), 3000), {timeout: 2500}); }
    else html.classList.add('fx-off');
  };
  if (document.readyState === 'complete') run();
  else addEventListener('load', run, {once: true});
}
