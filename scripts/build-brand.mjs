// Regenerates the committed brand files in public/ from src/shared/brand/logoSvg.ts.
//   node scripts/build-brand.mjs
// SVGs are plain string output. The favicon PNGs are rasterised by headless Chrome/Edge (no npm
// dependency); set CHROME_PATH if it is not in a default location. Run with Node 22.18+ (TypeScript import).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { faviconSvg, fullSvg, markSvg } from '../src/shared/brand/logoSvg.ts';

const root = resolve(import.meta.dirname, '..');
const brand = join(root, 'public', 'brand');
mkdirSync(brand, { recursive: true });

for (const scheme of ['light', 'dark']) {
  writeFileSync(join(brand, `t-men-mark-${scheme}.svg`), markSvg(scheme));
  writeFileSync(join(brand, `t-men-logo-${scheme}.svg`), fullSvg(scheme));
}
const favicon = faviconSvg();
writeFileSync(join(root, 'public', 'favicon.svg'), favicon);

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const chrome = candidates.find((p) => existsSync(p));
if (!chrome) {
  console.warn('SVGs written. No Chrome found, so the favicon PNGs were not regenerated (set CHROME_PATH).');
  process.exit(0);
}

const tmp = mkdtempSync(join(tmpdir(), 't-men-icons-'));
function png(size, name, background) {
  const html = join(tmp, `${name}.html`);
  writeFileSync(
    html,
    `<!doctype html><meta charset=utf-8><style>html,body{margin:0;background:${background}}img{display:block;width:${size}px;height:${size}px}</style><img src="data:image/svg+xml,${encodeURIComponent(favicon)}">`,
  );
  execFileSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--default-background-color=00000000',
    `--window-size=${size},${size}`,
    `--screenshot=${join(root, 'public', name)}`,
    pathToFileURL(html).href,
  ]);
}
png(32, 'favicon-32.png', 'transparent');
// iOS fills transparent touch icons with black, so this one is on the light page colour.
png(180, 'apple-touch-icon.png', '#FFFFFF');
console.log('Brand files written to public/.');
