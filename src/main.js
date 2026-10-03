import './styles/fonts.css';
import './styles/tokens.css';
import './styles/main.css';
import './styles/field.css';

import {GL} from './lib/gl.js';
import {initSmoothScroll, initChoreography} from './modules/scroll.js';
import {initNav} from './modules/nav.js';
import {initCursor} from './modules/cursor.js';
import {initHero} from './modules/hero.js';
import {initSkills} from './modules/skills.js';
import {initDrip} from './modules/cards/drip.js';
import {initWater} from './modules/cards/water.js';
import {initSystems} from './modules/cards/systems.js';
import {initCpu} from './modules/cards/cpu.js';
import {initMarquee} from './modules/marquee.js';
import {initGlobe} from './modules/globe.js';
import {initSignature} from './modules/signature.js';
import {initField} from './modules/field.js';

const lenis = initSmoothScroll();
initNav();
initCursor();
if (GL){ initHero(); initSkills(); }
initDrip();
initWater();
initSystems();
initCpu();
initMarquee();
initGlobe();
initSignature();
initField(lenis);
initChoreography();
