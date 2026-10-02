import * as T from 'three';

// The prototype was tuned on three r128, which did no colour management. Turning it off keeps
// the palette hex values and the pearl material looking identical on current three.js.
T.ColorManagement.enabled = false;

/* ---------- Shared pearl material: calm studio reflections from the palette ---------- */
function studioEnv(){
  // six canvas faces: +x,-x,+y,-y,+z,-z. Sky gradient from the palette with soft "windows" of light.
  const S = 256;
  const face = (i) => {
    const c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
    if (i === 2){ x.fillStyle = '#f2fafc'; x.fillRect(0,0,S,S); }
    else if (i === 3){ x.fillStyle = '#12354e'; x.fillRect(0,0,S,S); }
    else {
      const g = x.createLinearGradient(0,0,0,S);
      g.addColorStop(0,'#e6f4f8'); g.addColorStop(.45,'#a7d4e4'); g.addColorStop(.55,'#4f8fa6'); g.addColorStop(1,'#12354e');
      x.fillStyle = g; x.fillRect(0,0,S,S);
    }
    const soft = (cx, cy, w, h, col, a) => { x.save(); x.filter = 'blur(10px)'; x.globalAlpha = a; x.fillStyle = col; x.fillRect(cx - w/2, cy - h/2, w, h); x.restore(); };
    if (i === 4){ soft(S*.3, S*.25, S*.42, S*.16, '#ffffff', 1); soft(S*.78, S*.62, S*.12, S*.5, '#b5decc', .9); }
    if (i === 0){ soft(S*.5, S*.3, S*.2, S*.6, '#ffffff', .85); }
    if (i === 1){ soft(S*.4, S*.35, S*.5, S*.1, '#b5decc', .9); }
    if (i === 5){ soft(S*.5, S*.2, S*.8, S*.08, '#ffffff', .7); }
    if (i === 2){ soft(S*.5, S*.5, S*.5, S*.5, '#ffffff', 1); }
    return c;
  };
  const tex = new T.CubeTexture([0,1,2,3,4,5].map(face));
  tex.needsUpdate = true;
  return tex;
}

function glOK(){ try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch(e){ return false; } }
export const GL = glOK();
if (!GL) document.documentElement.classList.add('no-gl');

let mat = null;
// Created lazily so the cube map is only built when a scene actually needs it.
export function pearl(){
  return mat ??= new T.MeshPhysicalMaterial({color: new T.Color('#eef8fb'), metalness: .92, roughness: .04, clearcoat: 1, clearcoatRoughness: 0, envMap: studioEnv()});
}

export function makeRenderer(canvas){
  const r = new T.WebGLRenderer({canvas, antialias: true, alpha: true, powerPreference: 'high-performance'});
  // Lower pixel ratio on phones
  r.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 700 ? 1.5 : 2));
  r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.05;
  return r;
}

export function fit(r, cam, canvas){
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
}
