// Captures de contrôle à 1440×900 et 390×844 (Chrome installé sur la machine).
// Usage : npm run shots -- [url de base] [chemins…]
//   npm run shots                                   → http://localhost:4321, page d'accueil
//   npm run shots -- http://localhost:4321 / /styleguide
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const [base = 'http://localhost:4321', ...paths] = process.argv.slice(2);
const routes = paths.length ? paths : ['/'];
const viewports = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];
const outDir = '.screenshots';

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  for (const route of routes) {
    await page.goto(new URL(route, base).href, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const name = route.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'accueil';
    const file = `${outDir}/${name}-${viewport.width}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log(file);
  }
  await page.close();
}

await browser.close();
