import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import {reduce} from '../lib/env.js';

gsap.registerPlugin(ScrollTrigger);

/* ---------- Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync ---------- */
export function initSmoothScroll(){
  if (reduce) return null;
  const lenis = new Lenis({autoRaf: false, anchors: true});
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

/* ---------- Scroll choreography ---------- */
export function initChoreography(){
  if (reduce) return;
  gsap.from('.hero h1 .ln > span', {yPercent: 110, duration: 1, ease: 'power4.out', stagger: .1, delay: .1});
  gsap.from('.hero p, .hero-ctas, .hero .label', {opacity: 0, y: 14, duration: .8, ease: 'power3.out', stagger: .08, delay: .35});
  gsap.to('#hero', {scale: .94, borderRadius: 34, ease: 'none', scrollTrigger: {trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true}});
  gsap.utils.toArray('.card, .tile-cta, .moment').forEach(c => {
    gsap.from(c, {y: 60, duration: 1.1, ease: 'power3.out', scrollTrigger: {trigger: c, start: 'top 95%'}});
    const m = c.querySelector('.media'); if (m) gsap.fromTo(m, {yPercent: -4}, {yPercent: 4, ease: 'none', scrollTrigger: {trigger: c, start: 'top bottom', end: 'bottom top', scrub: true}});
  });
  gsap.utils.toArray('.sec-head .big, .dark-panel h2.title').forEach(el => gsap.from(el, {y: 40, opacity: .2, duration: 1, ease: 'power3.out', scrollTrigger: {trigger: el, start: 'top 92%'}}));
  gsap.utils.toArray('.skill, .b, .row').forEach((el, i) => gsap.from(el, {y: 40, duration: .9, ease: 'power3.out', delay: (i % 4) * .05, scrollTrigger: {trigger: el, start: 'top 96%'}}));
  document.querySelectorAll('[data-count]').forEach(el => {
    const end = +el.dataset.count, o = {v: 0};
    ScrollTrigger.create({trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, {v: end, duration: 1.6, ease: 'power3.out', onUpdate: () => el.textContent = Math.round(o.v)})});
  });
  gsap.from('.cta .display', {scale: .82, transformOrigin: 'left bottom', ease: 'none', scrollTrigger: {trigger: '.cta', start: 'top bottom', end: 'top 30%', scrub: true}});
}
