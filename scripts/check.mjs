import { chromium } from 'playwright-core';
const mode = process.argv[2] || 'desktop';
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM || '/Users/vitaly/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing', headless: true, args: ['--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--use-angle=swiftshader'] });
const errors = [];
const cfg = mode === 'mobile' ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
  : mode === 'tablet' ? { viewport: { width: 1024, height: 768 } }
  : mode === 'reduced' ? { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }
  : { viewport: { width: 1600, height: 900 } };
const page = await browser.newPage(cfg);
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text()); });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__paperworld?.ready, null, { timeout: 120000 });
await page.waitForTimeout(4000);
if (mode === 'desktop') {
  await page.screenshot({ path: 'shots/final-desktop.png', timeout: 60000 });
  await page.evaluate(() => window.__paperworld.jump('agents'));
  await page.evaluate(() => window.__paperworld.conveyor.run());
  await page.waitForTimeout(4000);
  console.log('demo:', await page.evaluate(() => ({ running: window.__paperworld.conveyor.running, p: +window.__paperworld.conveyor.progress.toFixed(2) })));
  await page.screenshot({ path: 'shots/final-demo.png', timeout: 60000 });
  console.log('stats', await page.evaluate(() => window.__paperworld.stats()));
} else {
  await page.screenshot({ path: `shots/final-${mode}.png`, timeout: 60000 });
}
console.log(mode, 'scrollWidth', await page.evaluate(() => document.documentElement.scrollWidth), 'inner', await page.evaluate(() => innerWidth));
console.log(mode, 'errors:', errors);
await browser.close();
