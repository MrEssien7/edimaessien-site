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

function video(src, outDir){
  fs.mkdirSync(outDir, {recursive: true});
  const name = stem(path.basename(src)), o = path.join(outDir, name);
  const vf = 'fps=30,scale=-2:min(ih\\,832)';
  const run = args => execFileSync(FFMPEG, ['-v', 'error', '-y', '-i', src, ...args], {stdio: 'inherit'});
  // -an drops audio; -map_metadata -1 drops container metadata (location, device, dates).
  run(['-an', '-map_metadata', '-1', '-vf', vf, '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-crf', '27', '-preset', 'slow', '-movflags', '+faststart', `${o}.mp4`]);
  run(['-an', '-map_metadata', '-1', '-vf', vf, '-c:v', 'libvpx-vp9', '-crf', '38', '-b:v', '0', '-row-mt', '1', `${o}.webm`]);
  run(['-an', '-map_metadata', '-1', '-ss', '0.5', '-frames:v', '1', '-vf', 'scale=-2:min(ih\\,832)', `${o}-poster.jpg`]);
  return o;
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
    else if (VIDEO.test(f)){
      const o = video(src, outDir);
      // Re-save the poster through sharp so it carries no metadata either. Read into memory first:
      // on Windows sharp keeps the source file open, which blocks overwriting it in place.
      const raw = fs.readFileSync(`${o}-poster.jpg`);
      const {width, height} = await sharp(raw).metadata();
      fs.writeFileSync(`${o}-poster.jpg`, await sharp(raw).jpeg({quality: 78, mozjpeg: true}).toBuffer());
      manifest[key] = {base: rel(o), video: true, width, height};
    }
  }
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
for (const [k, v] of Object.entries(manifest)){
  const files = fs.readdirSync(path.join(ROOT, 'public', path.dirname(v.base))).filter(f => f.startsWith(path.basename(v.base) + (v.video ? '' : '-')) || f.startsWith(path.basename(v.base) + '.'));
  const kb = files.reduce((a, f) => a + fs.statSync(path.join(ROOT, 'public', path.dirname(v.base), f)).size, 0) / 1024;
  console.log(`${k.padEnd(42)} ${v.width}x${v.height}  ${files.length} files  ${kb.toFixed(0)} KB`);
}
