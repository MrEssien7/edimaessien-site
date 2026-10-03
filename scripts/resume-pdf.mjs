// Runs after `vite build`: serves dist/, opens /resume/ in headless Chromium and prints it to dist/resume.pdf.
// The PDF is generated from the published page itself, so the two can't drift apart.
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {serveDist, DIST} from './serve-dist.mjs';

const OUT = path.join(DIST, 'resume.pdf');
const {server, origin} = serveDist();

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(`${origin}/resume/`, {waitUntil: 'networkidle'});
  await page.evaluate(() => document.fonts.ready);
  // Fail loudly if the content no longer fits on one Letter page.
  const overflow = await page.emulateMedia({media: 'print'}).then(() => page.evaluate(() => {
    const s = document.querySelector('.sheet-r'); return s.scrollHeight - s.clientHeight;
  }));
  if (overflow > 1) throw new Error(`Résumé is ${overflow}px taller than one Letter page. Shorten content/resume.json.`);
  await page.pdf({path: OUT, preferCSSPageSize: true, printBackground: true, tagged: true, outline: true});
  console.log(`resume.pdf written (${(fs.statSync(OUT).size / 1024).toFixed(0)} KB)`);
} finally {
  await browser.close();
  server.close();
}
