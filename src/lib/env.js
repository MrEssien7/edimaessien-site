// Shared helpers and environment flags used by every module.
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const $ = s => document.querySelector(s);
// Calls cb(true/false) as the element enters or leaves the viewport, so animations pause off screen.
export const visible = (el, cb) => new IntersectionObserver(([e]) => cb(e.isIntersecting), {rootMargin: '80px'}).observe(el);
