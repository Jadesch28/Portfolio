// robots.txt : tout est indexable ; le sitemap suit l'URL publique du site.
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://jadedeschuyteneer.be');
  return new Response(
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', base).href}\n`,
    {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    },
  );
};
