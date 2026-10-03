// Runs after `vite build`: serves dist/, opens /resume/ in headless Chromium and prints it to dist/resume.pdf.
// The PDF is generated from the published page itself, so the two can't drift apart.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';

const DIST = path.resolve(import.meta.dirname, '..', 'dist');
const OUT = path.join(DIST, 'resume.pdf');
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif'};

const server = http.createServer((req, res) => {
  let p = path.join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(DIST)) return res.writeHead(403).end();
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) return res.writeHead(404).end();
  res.writeHead(200, {'content-type': TYPES[path.extname(p)] || 'application/octet-stream'});
  fs.createReadStream(p).pipe(res);
}).listen(0);
const port = server.address().port;

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}/resume/`, {waitUntil: 'networkidle'});
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
