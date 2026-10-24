// sitemap.xml : les pages publiques et toutes les pages projet (calculées depuis la collection).
import type { APIRoute } from 'astro';
import { getProjets, projetHref } from '../data/projets';

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://jadedeschuyteneer.be');
  const projets = await getProjets();
  const chemins = ['/', '/a-propos', '/contact', ...projets.map(projetHref)];
  const urls = chemins
    .map((chemin) => `  <url><loc>${new URL(chemin, base).href}</loc></url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
