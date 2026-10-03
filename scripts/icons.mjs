// Favicons from the hero's Gentilis Bold E: npm run icons (writes to public/, commit the results).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {ePath} from '../plugins/e-svg.js';

const PUB = path.resolve(import.meta.dirname, '..', 'public');
// Paper-coloured E on an ink tile, the same pairing as the nav logo over the hero.
const tile = (size, radius) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#12354E"/><g transform="translate(${size * .5} ${size * .52}) scale(${size * .0007}) translate(-363 -428)"><path d="${ePath()}" fill="#F4F1EA"/></g></svg>`;

const svg = tile(64, 14);
fs.writeFileSync(path.join(PUB, 'favicon.svg'), svg);
const png = (size, radius = size * .22) => sharp(Buffer.from(tile(size, radius))).png().toBuffer();
fs.writeFileSync(path.join(PUB, 'apple-touch-icon.png'), await png(180, 0)); // iOS rounds the corners itself
fs.writeFileSync(path.join(PUB, 'icon-192.png'), await png(192));
fs.writeFileSync(path.join(PUB, 'icon-512.png'), await png(512));

// favicon.ico: a single 32x32 PNG wrapped in the ICO container (valid in every browser that asks for /favicon.ico).
const p32 = await png(32, 7);
const head = Buffer.alloc(22);
head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(1, 4);
head.writeUInt8(32, 6); head.writeUInt8(32, 7); head.writeUInt8(0, 8); head.writeUInt8(0, 9);
head.writeUInt16LE(1, 10); head.writeUInt16LE(32, 12); head.writeUInt32LE(p32.length, 14); head.writeUInt32LE(22, 18);
fs.writeFileSync(path.join(PUB, 'favicon.ico'), Buffer.concat([head, p32]));
console.log('favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png written');
