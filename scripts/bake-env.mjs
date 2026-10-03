// Pre-computes the pearl material's reflection map (three.js PMREM of the studio cube in src/lib/gl.js)
// and saves it as public/media/env/studio-pmrem.webp (lossless). Browsers then load this small image instead of
// blurring the cube themselves, which was the most expensive part of starting the 3D scenes.
// Run when studioEnv() changes: npm run bake-env
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'vite';
import {chromium} from 'playwright';
import sharp from 'sharp';

const OUT = path.resolve(import.meta.dirname, '..', 'public', 'media', 'env', 'studio-pmrem.webp');
const server = await createServer({server: {port: 0}, logLevel: 'error'});
await server.listen();
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(server.resolvedUrls.local[0] + 'resume/', {waitUntil: 'load'});
  const {png, width, height} = await page.evaluate(async () => {
    const T = await import('/node_modules/three/build/three.module.js');
    const {studioEnv} = await import('/src/lib/gl.js');
    const renderer = new T.WebGLRenderer();
    const rt = new T.PMREMGenerator(renderer).fromCubemap(studioEnv());
    const {width, height} = rt;
    // PMREM targets are half-float; the source cube is 8-bit, so 8 bits per channel keeps its precision.
    const half = new Uint16Array(width * height * 4);
    renderer.readRenderTargetPixels(rt, 0, 0, width, height, half);
    const img = new ImageData(width, height);
    for (let i = 0; i < half.length; i++) img.data[i] = Math.round(Math.min(1, Math.max(0, i % 4 === 3 ? 1 : T.DataUtils.fromHalfFloat(half[i]))) * 255);
    const c = new OffscreenCanvas(width, height); c.getContext('2d').putImageData(img, 0, 0);
    // Rows stay in GL order (row 0 = bottom); the runtime uploads with flipY off, so they line up again.
    const blob = await c.convertToBlob({type: 'image/png'});
    const dataUrl = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob); });
    return {png: dataUrl.split(',')[1], width, height};
  });
  fs.mkdirSync(path.dirname(OUT), {recursive: true});
  await sharp(Buffer.from(png, 'base64')).webp({lossless: true, effort: 6}).toFile(OUT);
  console.log(`studio-pmrem.webp ${width}x${height}, ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
} finally {
  await browser.close();
  await server.close();
}
