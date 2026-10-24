// Génère public/og.png (1200 × 630) et les favicons depuis la page /og du serveur de dev.
// Usage : npm run dev (dans un autre terminal), puis npm run og
import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:4321';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 1200 } });
await page.goto(new URL('/og', base).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

await page.locator('[data-capture="og"]').screenshot({ path: 'public/og.png' });

// Favicon : capture du carré à différentes tailles (rendu net à chaque taille).
const icone = page.locator('[data-capture="icone"]');
const tailles = { 'apple-touch-icon.png': 180, 'favicon.png': 192, 'icone-512.png': 512 };
for (const [nom, taille] of Object.entries(tailles)) {
  const tampon = await icone.screenshot({ scale: 'css', type: 'png' });
  const redimension = await browser.newPage({ viewport: { width: taille, height: taille } });
  await redimension.setContent(
    `<body style="margin:0"><img src="data:image/png;base64,${tampon.toString('base64')}" width="${taille}" height="${taille}" style="display:block"></body>`,
  );
  await redimension.screenshot({
    path: `public/${nom}`,
    clip: { x: 0, y: 0, width: taille, height: taille },
  });
  await redimension.close();
}

// favicon.ico : PNG 32 × 32 et 16 × 16 emballés dans un conteneur ICO.
const pngs = [];
for (const taille of [16, 32]) {
  const tampon = await icone.screenshot({ type: 'png' });
  const redimension = await browser.newPage({ viewport: { width: taille, height: taille } });
  await redimension.setContent(
    `<body style="margin:0"><img src="data:image/png;base64,${tampon.toString('base64')}" width="${taille}" height="${taille}" style="display:block"></body>`,
  );
  pngs.push({
    taille,
    data: await redimension.screenshot({ clip: { x: 0, y: 0, width: taille, height: taille } }),
  });
  await redimension.close();
}
const entete = Buffer.alloc(6 + 16 * pngs.length);
entete.writeUInt16LE(0, 0);
entete.writeUInt16LE(1, 2);
entete.writeUInt16LE(pngs.length, 4);
let decalage = entete.length;
pngs.forEach(({ taille, data }, i) => {
  const o = 6 + 16 * i;
  entete.writeUInt8(taille, o);
  entete.writeUInt8(taille, o + 1);
  entete.writeUInt16LE(1, o + 4);
  entete.writeUInt16LE(32, o + 6);
  entete.writeUInt32LE(data.length, o + 8);
  entete.writeUInt32LE(decalage, o + 12);
  decalage += data.length;
});
await writeFile('public/favicon.ico', Buffer.concat([entete, ...pngs.map((p) => p.data)]));

await browser.close();
console.log('public/og.png, favicon.ico, favicon.png, apple-touch-icon.png, icone-512.png');
