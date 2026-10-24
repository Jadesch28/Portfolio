import { defineConfig, fontProviders } from 'astro/config';
import type { AstroIntegration } from 'astro';

// URL publique du site (canonical, sitemap, Open Graph).
// Ordre : SITE_URL si définie, sinon le domaine de production fourni par Vercel
// (le domaine personnalisé dès qu'il est branché, sinon *.vercel.app), sinon le domaine final.
const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site =
  process.env.SITE_URL ||
  (vercelProduction ? `https://${vercelProduction}` : 'https://jadedeschuyteneer.be');

// Les pages /styleguide et /og (source de l'image de partage et du favicon) n'existent qu'en
// développement : elles ne sont jamais générées au build.
// Les pages d'essai (/essais/…) existent aussi sur les aperçus Vercel (branches autres que main),
// jamais en production.
const styleguideDevOnly = (): AstroIntegration => ({
  name: 'styleguide-dev-only',
  hooks: {
    'astro:config:setup': ({ command, injectRoute }) => {
      if (command === 'dev') {
        injectRoute({ pattern: '/styleguide', entrypoint: './src/dev/styleguide.astro' });
        injectRoute({ pattern: '/og', entrypoint: './src/dev/og.astro' });
      }
      if (command === 'dev' || process.env.VERCEL_ENV === 'preview') {
        injectRoute({ pattern: '/essais/corde', entrypoint: './src/dev/essai-corde.astro' });
      }
    },
  },
});

const fontFile = (pkg: string, file: string) => `${pkg}/files/${file}`;

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file' },
  devToolbar: { enabled: false },
  integrations: [styleguideDevOnly()],
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Big Shoulders Stencil',
      cssVariable: '--font-stencil',
      fallbacks: ['Arial Narrow', 'Impact', 'sans-serif'],
      options: {
        variants: [
          {
            src: [
              fontFile(
                '@fontsource/big-shoulders-stencil',
                'big-shoulders-stencil-latin-900-normal.woff2',
              ),
            ],
            weight: 900,
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Archivo Narrow',
      cssVariable: '--font-text',
      fallbacks: ['Arial Narrow', 'sans-serif'],
      options: {
        variants: [
          {
            src: [
              fontFile(
                '@fontsource-variable/archivo-narrow',
                'archivo-narrow-latin-wght-normal.woff2',
              ),
            ],
            weight: '400 700',
            style: 'normal',
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Gochi Hand',
      cssVariable: '--font-hand',
      fallbacks: ['Segoe Print', 'Comic Sans MS', 'cursive'],
      options: {
        variants: [
          {
            src: [fontFile('@fontsource/gochi-hand', 'gochi-hand-latin-400-normal.woff2')],
            weight: 400,
            style: 'normal',
          },
        ],
      },
    },
  ],
});
