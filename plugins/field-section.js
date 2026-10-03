// Renders the "In the field" section (and the portrait) into index.html at build time from
// content/field.json and content/media-manifest.json, so the content is plain HTML with no JS needed.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'content', 'field.json');
const MANIFEST = path.join(ROOT, 'content', 'media-manifest.json');
const TYPES = ['moment', 'recognition'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]);
const read = f => JSON.parse(fs.readFileSync(f, 'utf8'));

function fmtDate(d){
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(d);
  if (!m) throw new Error(`field.json: date "${d}" must be YYYY-MM-DD or YYYY-MM`);
  return m[3] ? `${MONTHS[+m[2] - 1]} ${+m[3]}, ${m[1]}` : `${MONTHS[+m[2] - 1]} ${m[1]}`;
}

function media(manifest, key){
  const m = manifest[key];
  if (!m) throw new Error(`No processed media for "${key}". Put the file in media-src/${key} and run \`npm run media\`.`);
  return m;
}

// <picture> with AVIF, WebP and JPEG srcsets. focus sets object-position for cropped displays.
export function picture(m, {alt, sizes, cls = '', loading = 'lazy', focus}){
  const set = ext => m.widths.map(w => `/${m.base}-${w}.${ext} ${w}w`).join(', ');
  const big = m.widths[m.widths.length - 1];
  const h = Math.round(m.height * big / m.width);
  const style = focus ? ` style="object-position:${esc(focus)}"` : '';
  return `<picture${cls ? ` class="${cls}"` : ''}><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}"><img src="/${m.base}-${m.widths[Math.min(1, m.widths.length - 1)]}.jpg" srcset="${set('jpg')}" sizes="${sizes}" width="${big}" height="${h}" alt="${esc(alt)}" loading="${loading}" decoding="async"${style}></picture>`;
}

function validate(list){
  const slugs = new Set();
  for (const [i, m] of list.entries()){
    const at = `field.json moments[${i}]${m.slug ? ` (${m.slug})` : ''}`;
    for (const k of ['slug', 'type', 'title', 'date', 'organization', 'place', 'story']) if (!m[k]) throw new Error(`${at}: missing "${k}"`);
    if (!TYPES.includes(m.type)) throw new Error(`${at}: type must be "moment" or "recognition"`);
    if (!/^[a-z0-9-]+$/.test(m.slug) || slugs.has(m.slug)) throw new Error(`${at}: slug must be unique, lowercase letters, numbers and hyphens`);
    slugs.add(m.slug);
    if (!Array.isArray(m.photos) || m.photos.length < 1 || m.photos.length > 4) throw new Error(`${at}: needs 1 to 4 photos`);
    for (const p of m.photos) if (!p.file || !p.alt) throw new Error(`${at}: every photo needs "file" and "alt"`);
    if (m.video && (!m.video.file || !m.video.alt)) throw new Error(`${at}: video needs "file" and "alt"`);
    if (m.link && (!m.link.href || !m.link.label)) throw new Error(`${at}: link needs "href" and "label"`);
  }
}

function card(m, i, manifest){
  const cover = m.photos[0], cm = media(manifest, `field/${m.slug}/${cover.file}`);
  const count = m.photos.length + (m.video ? 1 : 0);
  return `<li><button class="moment" type="button" data-moment="${esc(m.slug)}" data-cursor aria-haspopup="dialog" aria-label="${esc(`${m.title}, ${m.organization}, ${fmtDate(m.date)}. Open details`)}">
  <div class="media">${picture(cm, {alt: '', sizes: '(max-width:680px) 84vw, (max-width:1100px) 46vw, 40vw', focus: cover.focus})}</div>
  <div class="top"><span>${String(i + 1).padStart(2, '0')}</span><span>${esc(fmtDate(m.date))}</span></div>
  <div class="meta"><div><h3>${esc(m.title)}</h3><div class="pills"><span class="pill">${esc(m.organization)}</span><span class="pill">${esc(m.place)}</span></div></div><span class="yr">${count} ${count === 1 ? 'photo' : m.video ? 'items' : 'photos'} ↗</span></div>
</button></li>`;
}

// Detail views are <template>s; field.js clones one into the shared <dialog> when a card opens.
function detail(m, manifest){
  const slides = m.photos.map(p => `<li class="slide">${picture(media(manifest, `field/${m.slug}/${p.file}`), {alt: p.alt, sizes: '(max-width:900px) 100vw, 58vw'})}</li>`);
  if (m.video){
    const v = media(manifest, `field/${m.slug}/${m.video.file}`);
    // preload="none" and no autoplay attribute: nothing downloads until the slide is shown.
    slides.push(`<li class="slide is-video"><video muted loop playsinline preload="none" poster="/${v.base}-poster.jpg" width="${v.width}" height="${v.height}" aria-label="${esc(m.video.alt)}"><source src="/${v.base}.webm" type="video/webm"><source src="/${v.base}.mp4" type="video/mp4"></video></li>`);
  }
  const n = slides.length;
  return `<template id="moment-${esc(m.slug)}">
  <div class="fd-gallery" role="region" aria-roledescription="carousel" aria-label="${esc(m.title)} photos">
    <ul class="fd-track" tabindex="0" aria-label="Use the arrow keys to move between photos">${slides.join('')}</ul>
    ${n > 1 ? `<div class="fd-nav"><button type="button" class="fd-prev" aria-label="Previous photo">←</button><span class="mono fd-count" aria-live="polite">1 / ${n}</span><button type="button" class="fd-next" aria-label="Next photo">→</button></div>` : ''}
  </div>
  <div class="fd-text">
    <span class="label">( ${esc(m.organization)} · ${esc(m.place)} )</span>
    <h2 class="fd-title" id="fd-title">${esc(m.title)}</h2>
    <p class="mono fd-date">${esc(fmtDate(m.date))}</p>
    <p class="fd-story">${esc(m.story)}</p>
    ${m.outcome ? `<p class="fd-outcome"><span class="mono">Outcome</span>${esc(m.outcome)}</p>` : ''}
    ${m.link ? `<a class="btn dark" href="${esc(m.link.href)}"><span>${esc(m.link.label)}</span><span class="arr">→</span></a>` : ''}
  </div>
</template>`;
}

export function renderField(){
  const {moments} = read(CONTENT), manifest = read(MANIFEST);
  validate(moments);
  const byDate = [...moments].sort((a, b) => b.date.localeCompare(a.date));
  const main = byDate.filter(m => m.type === 'moment'), rec = byDate.filter(m => m.type === 'recognition');
  const row = (list, label) => `<ul class="field-row" role="list" aria-label="${label}">${list.map((m, i) => card(m, i, manifest)).join('\n')}</ul>`;
  return `<section class="sec" id="field" aria-labelledby="field-h">
    <span class="label">( Out there ) ↓</span>
    <div class="sec-head"><h2 class="big" id="field-h">In the field</h2></div>
    ${main.length ? row(main, 'Moments') : ''}
    ${rec.length ? `<div class="field-rec"><h3 class="field-sub" id="field-rec-h">Recognition</h3>${row(rec, 'Recognition')}</div>` : ''}
    ${byDate.map(m => detail(m, manifest)).join('\n')}
  </section>`;
}

export function renderPortrait(){
  const m = media(read(MANIFEST), 'portrait/portrait.jpg');
  return picture(m, {alt: 'Portrait of Edima Essien', sizes: '(max-width:980px) 100vw, 33vw', cls: 'ph-img'});
}

// Drip demo slot. Only when content/media-manifest.json has "drip/demo" (a real screen recording in
// media-src/drip/) does the Drip card get a "Watch the demo" button and player; otherwise it is untouched.
// The button can't live inside the card's <a>, so the card is wrapped in a .card-slot that takes its grid span.
const DEMO_LABEL = 'Drip demo, screen recording';
const DEMO_DIALOG = m => `<dialog class="demo-dlg" id="demoDialog" aria-label="${esc(DEMO_LABEL)}" data-lenis-prevent>
  <button type="button" class="fd-close" id="demoClose"><span>Close</span> <span aria-hidden="true">✕</span></button>
  <video controls playsinline preload="none" poster="/${m.base}-poster.jpg" width="${m.width}" height="${m.height}" aria-label="${esc(DEMO_LABEL)}"><source src="/${m.base}.webm" type="video/webm"><source src="/${m.base}.mp4" type="video/mp4"></video>
</dialog>
`;
export function renderDripDemo(html){
  const m = read(MANIFEST)['drip/demo'];
  const re = /<!-- @drip-card -->\r?\n([\s\S]*?)[ \t]*<!-- \/@drip-card -->\r?\n?/;
  if (!m) return html.replace(re, '$1');
  // The player goes next to the other dialogs, outside the work grid, so it doesn't take a grid cell.
  html = html.replace(/<\/main>\r?\n/, match => match + DEMO_DIALOG(m));
  return html.replace(re, (_, card) => `<div class="card-slot wide">
${card}      <button type="button" class="btn light demo-open" id="demoOpen" aria-haspopup="dialog"><span>Watch the demo</span><span class="arr" aria-hidden="true">▶</span></button>
      </div>
`);
}

export default function fieldSection(){
  return {
    name: 'field-section',
    transformIndexHtml: {
      order: 'pre',
      handler: html => renderDripDemo(html).replace('<!-- @field -->', renderField()).replace('<!-- @portrait -->', renderPortrait()),
    },
    configureServer(server){
      // Editing the content file or regenerating media reloads the dev page.
      server.watcher.add([CONTENT, MANIFEST]);
      server.watcher.on('change', f => { if (f === CONTENT || f === MANIFEST) server.ws.send({type: 'full-reload'}); });
    },
  };
}
