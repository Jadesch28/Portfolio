// Données structurées (JSON-LD) : Person pour l'accueil et l'à propos, CreativeWork pour les projets.
import { site } from './site';

/** Jade, à partir de l'URL publique du site. */
export const personne = (siteUrl: URL) => ({
  '@type': 'Person',
  '@id': new URL('/#jade', siteUrl).href,
  name: site.nom,
  jobTitle: 'Graphiste, motion designer & illustratrice',
  url: new URL('/', siteUrl).href,
  email: `mailto:${site.email}`,
  address: { '@type': 'PostalAddress', addressCountry: 'BE' },
  sameAs: [site.reseaux.instagram, site.reseaux.linkedin],
});

export const avecContexte = <T extends object>(donnees: T) => ({
  '@context': 'https://schema.org',
  ...donnees,
});
