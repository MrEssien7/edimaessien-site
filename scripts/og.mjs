// Social share image (public/og.png, 1200x630): a capture of the real hero, porcelain E included.
// Run after a build when the hero changes: npm run build && npm run og
import path from 'node:path';
import {chromium} from 'playwright';
import {serveDist} from './serve-dist.mjs';

const OUT = path.resolve(import.meta.dirname, '..', 'public', 'og.png');
const {server, origin} = serveDist();
const browser = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
try {
  const page = await browser.newPage({viewport: {width: 1200, height: 630}, deviceScaleFactor: 1});
  await page.goto(origin + '/', {waitUntil: 'networkidle'});
  // Hero only: no nav, cursor or footer line; the panel fills the frame.
  await page.addStyleTag({content: '.nav,.cursor,.skip,.hero-foot{display:none!important}.page{padding:0!important}.hero{height:630px!important;min-height:0!important;border-radius:0!important;transform:none!important}'});
  await page.waitForSelector('#heroGL.ready', {timeout: 20000});
  await page.waitForTimeout(2500);
  await page.screenshot({path: OUT, clip: {x: 0, y: 0, width: 1200, height: 630}});
  console.log('og.png written');
} finally {
  await browser.close();
  server.close();
}
