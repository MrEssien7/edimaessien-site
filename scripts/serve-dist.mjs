// Tiny static server for dist/, used by the build-time scripts (résumé PDF, social image).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

export const DIST = path.resolve(import.meta.dirname, '..', 'dist');
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.json': 'application/json', '.mp4': 'video/mp4', '.webm': 'video/webm'};

export function serveDist(){
  const server = http.createServer((req, res) => {
    let p = path.join(DIST, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!p.startsWith(DIST)) return res.writeHead(403).end();
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
    if (!fs.existsSync(p)) return res.writeHead(404).end();
    res.writeHead(200, {'content-type': TYPES[path.extname(p)] || 'application/octet-stream'});
    fs.createReadStream(p).pipe(res);
  }).listen(0);
  return {server, origin: `http://localhost:${server.address().port}`};
}
