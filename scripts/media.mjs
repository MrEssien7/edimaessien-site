// Builds web-ready media from the private originals in media-src/ (gitignored, since raw photos can carry GPS).
//   npm run media
// Photos: auto-rotated, every bit of EXIF/GPS/XMP/ICC metadata dropped (sharp writes none unless asked),
// then AVIF, WebP and JPEG at a few widths, never upscaled. Videos: audio removed, re-encoded to a short
// silent WebM + MP4 loop with a poster frame (needs ffmpeg on PATH, or FFMPEG=/path/to/ffmpeg).
// Output goes to public/media/, and content/media-manifest.json records each image's widths and size.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import sharp from 'sharp';

sharp.cache(false);

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'media-src'), OUT = path.join(ROOT, 'public', 'media');
const MANIFEST = path.join(ROOT, 'content', 'media-manifest.json');
const FFMPEG = process.env.FFMPEG || 'ffmpeg';

const PHOTO_WIDTHS = [480, 800, 1200];
const IMAGE = /\.(jpe?g|png|webp|heic|avif|tiff?)$/i, VIDEO = /\.(mp4|mov|m4v|webm)$/i;

const rel = p => path.relative(path.join(ROOT, 'public'), p).split(path.sep).join('/');
const stem = f => f.replace(/\.[^.]+$/, '');

async function photo(src, outDir, {aspect} = {}){
  fs.mkdirSync(outDir, {recursive: true});
  // Rotate from EXIF orientation first, since the metadata is about to be discarded.
  let base = sharp(src).rotate();
  let {width, height} = await base.clone().toBuffer({resolveWithObject: true}).then(r => r.info);
  if (aspect){
    // Crop to the target aspect by trimming from the top (keeps head, shoulders and the bottom edge).
    const h = Math.min(height, Math.round(width / aspect));
    base = sharp(await base.extract({left: 0, top: height - h, width, height: h}).toBuffer());
    height = h;
  }
  const widths = [...new Set(PHOTO_WIDTHS.map(w => Math.min(w, width)))];
  const name = stem(path.basename(src));
  for (const w of widths){
    const r = base.clone().resize({width: w, withoutEnlargement: true});
    await r.clone().avif({quality: 52, effort: 6}).toFile(path.join(outDir, `${name}-${w}.avif`));
    await r.clone().webp({quality: 74}).toFile(path.join(outDir, `${name}-${w}.webp`));
    await r.clone().jpeg({quality: 78, mozjpeg: true}).toFile(path.join(outDir, `${name}-${w}.jpg`));
  }
  return {base: rel(path.join(outDir, name)), widths, width, height};
}

// Loops (field moments) are silent and capped at 832px tall. The Drip demo keeps its sound, since it plays
// with controls, and is capped at 1280px wide (screen recordings are landscape).
async function video(src, outDir, {audio = false, scale = 'scale=-2:min(ih\\,832)', crf = [27, 38]} = {}){
  fs.mkdirSync(outDir, {recursive: true});
  const name = stem(path.basename(src)), o = path.join(outDir, name);
  const vf = `fps=30,${scale}`;
  const run = args => execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', src, ...args], {stdio: 'inherit'});
  // -map_metadata -1 drops container metadata (location, device, dates); -an drops audio for silent loops.
  const a = codec => audio ? ['-c:a', codec, '-b:a', codec === 'aac' ? '96k' : '64k'] : ['-an'];
  run([...a('aac'), '-map_metadata', '-1', '-vf', vf, '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', String(crf[0]), '-preset', 'slow', '-movflags', '+faststart', `${o}.mp4`]);
  run([...a('libopus'), '-map_metadata', '-1', '-vf', vf, '-c:v', 'libvpx-vp9', '-crf', String(crf[1]), '-b:v', '0', '-row-mt', '1', `${o}.webm`]);
  run(['-an', '-map_metadata', '-1', '-ss', '0.5', '-frames:v', '1', '-vf', scale, `${o}-poster.jpg`]);
  // Re-save the poster through sharp so it carries no metadata either. Read into memory first:
  // on Windows sharp keeps the source file open, which blocks overwriting it in place.
  const raw = fs.readFileSync(`${o}-poster.jpg`);
  const {width, height} = await sharp(raw).metadata();
  fs.writeFileSync(`${o}-poster.jpg`, await sharp(raw).jpeg({quality: 78, mozjpeg: true}).toBuffer());
  for (const ext of ['mp4', 'webm']){
    const mb = fs.statSync(`${o}.${ext}`).size / 1048576;
    if (mb > 5) console.warn(`! ${rel(o)}.${ext} is ${mb.toFixed(1)} MB, over the 5 MB budget. Trim the source or raise crf.`);
  }
  return {base: rel(o), video: true, width, height};
}

const manifest = {};
const portrait = path.join(SRC, 'portrait', 'portrait.jpg');
if (fs.existsSync(portrait)) manifest['portrait/portrait.jpg'] = await photo(portrait, path.join(OUT, 'portrait'), {aspect: 4 / 5});

const fieldSrc = path.join(SRC, 'field');
for (const slug of fs.existsSync(fieldSrc) ? fs.readdirSync(fieldSrc) : []){
  const dir = path.join(fieldSrc, slug), outDir = path.join(OUT, 'field', slug);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const f of fs.readdirSync(dir).sort()){
    const src = path.join(dir, f), key = `field/${slug}/${f}`;
    if (IMAGE.test(f)) manifest[key] = await photo(src, outDir);
    else if (VIDEO.test(f)) manifest[key] = await video(src, outDir);
  }
}

// Drip demo slot: drop a real screen recording at media-src/drip/demo.mp4 (or .mov/.webm) and the
// "Watch the demo" button appears on the Drip card. With no file, the card stays exactly as it is.
const dripDir = path.join(SRC, 'drip');
const demo = fs.existsSync(dripDir) && fs.readdirSync(dripDir).find(f => /^demo\./.test(f) && VIDEO.test(f));
if (demo) manifest['drip/demo'] = await video(path.join(dripDir, demo), path.join(OUT, 'drip'), {audio: true, scale: "scale='min(1280,iw)':-2", crf: [28, 40]});

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
for (const [k, v] of Object.entries(manifest)){
  const files = fs.readdirSync(path.join(ROOT, 'public', path.dirname(v.base))).filter(f => f.startsWith(path.basename(v.base) + (v.video ? '' : '-')) || f.startsWith(path.basename(v.base) + '.'));
  const kb = files.reduce((a, f) => a + fs.statSync(path.join(ROOT, 'public', path.dirname(v.base), f)).size, 0) / 1024;
  console.log(`${k.padEnd(42)} ${v.width}x${v.height}  ${files.length} files  ${kb.toFixed(0)} KB`);
}
