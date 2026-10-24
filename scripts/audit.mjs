// Audit d'accessibilité axe-core (WCAG 2.2 A/AA) sur toutes les pages, en desktop et en mobile.
// Usage : serveur lancé (npm run dev ou build + preview), puis npm run audit -- [url de base]
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const axe = require.resolve('axe-core/axe.min.js');
const base = process.argv[2] ?? 'http://localhost:4321';
const pages = [
  '/',
  '/projets/rituel',
  '/projets/tamagotchi-paradise',
  '/projets/doudou-illustre',
  '/projets/nogozone',
  '/projets/repetition-critique',
  '/a-propos',
  '/contact',
  '/404',
];

const browser = await chromium.launch({ channel: 'chrome' });
let total = 0;

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  const contexte = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  for (const chemin of pages) {
    const page = await contexte.newPage();
    await page.goto(new URL(chemin, base).href, { waitUntil: 'networkidle' });
    // Tout faire apparaître (apparitions au scroll), puis revenir en haut.
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 30));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);
    await page.addScriptTag({ path: axe });
    const resultats = await page.evaluate(() =>
      window.axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
        },
      }),
    );
    const violations = resultats.violations;
    total += violations.length;
    console.log(
      `${viewport.width} ${chemin} : ${violations.length ? violations.length + ' problème(s)' : 'OK'}`,
    );
    for (const v of violations) {
      console.log(`  - [${v.impact}] ${v.id} : ${v.help}`);
      for (const n of v.nodes.slice(0, 3)) console.log(`      ${n.target.join(' ')}`);
    }
    await page.close();
  }
  await contexte.close();
}

await browser.close();
process.exit(total ? 1 : 0);
