import './styles/fonts.css';
import './styles/tokens.css';
import './styles/main.css';
import './styles/field.css';
import './styles/stills.css';

import {gpuContext, afterLoad, whenNear} from './lib/env.js';
import {initSmoothScroll, initChoreography} from './modules/scroll.js';
import {initNav} from './modules/nav.js';
import {initCursor} from './modules/cursor.js';
import {initDrip} from './modules/cards/drip.js';
import {initWater} from './modules/cards/water.js';
import {initSystems} from './modules/cards/systems.js';
import {initCpu} from './modules/cards/cpu.js';
import {initMarquee} from './modules/marquee.js';
import {initGlobe} from './modules/globe.js';
import {initSignature} from './modules/signature.js';
import {initField} from './modules/field.js';
import {initDemo} from './modules/demo.js';

const lenis = initSmoothScroll();
initNav();
initCursor();
// The page first shows still renders of the 3D objects. After load, if there is a real GPU, three.js
// (a separate chunk) builds the live scenes and they crossfade in; otherwise the stills simply stay.
afterLoad(() => {
  const context = gpuContext(document.getElementById('heroGL'));
  if (!context){ document.documentElement.classList.add('no-gl'); return; }
  import('./modules/hero.js').then(m => m.initHero(context));
  import('./modules/skills.js').then(m => m.initSkills());
});
initDrip();
initWater();
// Below-the-fold 2D canvases start when they come near, so their GPU-backed contexts aren't created during load.
whenNear(document.getElementById('sysCv'), initSystems);
initCpu();
initMarquee();
whenNear(document.getElementById('globe'), initGlobe);
initSignature();
initField(lenis);
initDemo(lenis);
initChoreography();
