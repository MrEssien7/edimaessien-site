// Shared helpers and environment flags used by every module.
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const $ = s => document.querySelector(s);
// Calls cb(true/false) as the element enters or leaves the viewport, so animations pause off screen.
export const visible = (el, cb) => new IntersectionObserver(([e]) => cb(e.isIntersecting), {rootMargin: '80px'}).observe(el);

// Live 3D only with real GPU acceleration. Without WebGL, or when WebGL would run on a software
// renderer (SwiftShader, llvmpipe: no GPU, or a blocklisted one), every frame would be drawn on the CPU
// and make the page stutter, so the still images of the same 3D objects stay instead.
// Runs after load on the canvas that will be used: creating a GPU context is slow, so the check's context
// is handed straight to three.js rather than making a second one. ?still and ?3d force either mode.
export const GL_ATTRS = {antialias: true, alpha: true, powerPreference: 'high-performance'};
export function gpuContext(canvas){
  const q = location.search;
  if (/[?&]still\b/.test(q) || !window.WebGLRenderingContext) return null;
  try {
    const g = canvas.getContext('webgl2', GL_ATTRS);
    if (!g) return null;
    if (/[?&]3d\b/.test(q)) return g;
    const dbg = g.getExtension('WEBGL_debug_renderer_info');
    const name = String(g.getParameter(dbg ? dbg.UNMASKED_RENDERER_WEBGL : g.RENDERER));
    if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(name)){ g.getExtension('WEBGL_lose_context')?.loseContext(); return null; }
    return g;
  } catch(e){ return null; }
}

// Run fn once the page has loaded and the main thread is idle, so heavy work never delays first paint.
export function afterLoad(fn){
  const idle = () => (window.requestIdleCallback || (f => setTimeout(f, 200)))(fn, {timeout: 2500});
  if (document.readyState === 'complete') idle(); else addEventListener('load', idle, {once: true});
}

// Run fn once, the first time el comes within `margin` of the viewport (for below-the-fold canvases).
export function whenNear(el, fn, margin = '600px'){
  if (!el) return;
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting){ io.disconnect(); fn(); } }, {rootMargin: margin});
  io.observe(el);
}
