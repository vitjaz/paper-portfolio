// Headless review shots. Usage: node scripts/shot.mjs <out.png> [w] [h] [waitMs] [hash]
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const out = process.argv[2] || 'shots/overview.png';
const w = Number(process.argv[3] || 1600);
const h = Number(process.argv[4] || 900);
const wait = Number(process.argv[5] || 0);
const hash = process.argv[6] || '';
mkdirSync('shots', { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM || '/Users/vitaly/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  headless: true,
  args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--allow-file-access-from-files'],
});
const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const logs = [];
page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`));
page.on('pageerror', (e) => logs.push(`PAGEERROR: ${e.message}\n${e.stack || ''}`));
await page.goto(`http://localhost:5173/${hash}`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__paperworld && window.__paperworld.ready, null, { timeout: 120000 }).catch(() => {});
if (wait) await page.waitForTimeout(wait);
await page.screenshot({ path: out });
console.log('saved', out);
console.log(logs.filter((l) => !l.includes('WebGL') || l.includes('error')).slice(0, 40).join('\n'));
await browser.close();
