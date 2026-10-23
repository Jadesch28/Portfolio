// Petits textes éditables du site. Les phrases manuscrites sont à faire valider par Jade.

export const site = {
  nom: 'Jade Deschuyteneer',
  nomCourt: 'Jade D.',
  email: import.meta.env.PUBLIC_CONTACT_EMAIL || 'deschuyteneerjade@gmail.com',
  reseaux: {
    instagram: 'https://www.instagram.com/design_by_jade_/',
    linkedin: 'https://www.linkedin.com/in/jade-deschuyteneer-255718251/',
  },
} as const;

export type NavId = 'projets' | 'a-propos' | 'contact';

/** Liens de l'en-tête (desktop) ; le dernier est en Dymo rouille. */
export const navigation: ReadonlyArray<{ id: NavId; label: string; href: string }> = [
  { id: 'projets', label: 'Mes projets', href: '/#projets' },
  { id: 'a-propos', label: 'À propos', href: '/a-propos' },
  { id: 'contact', label: 'Contact', href: '/contact' },
];

export const menuMobile = {
  titre: 'Menu',
  ouvrir: 'Menu',
  fermer: 'Fermer',
  accueil: 'Accueil',
} as const;

export const footer = {
  retourEnHaut: 'retour en haut',
} as const;
