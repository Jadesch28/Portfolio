// Petits textes éditables du site.
// Les longs textes (bio, phrases d'accroche) viennent mot pour mot de l'ancien site WordPress ;
// les phrases manuscrites et les textes d'interface viennent des maquettes : à faire valider par Jade.
// Dans `bio`, les passages entre ==…== sont surlignés au scroll.
import type { ImageMetadata } from 'astro';
import atelier from '../assets/jade/atelier.jpg';
import afterEffects from '../assets/logiciels/after-effects.svg';
import figma from '../assets/logiciels/figma.svg';
import illustrator from '../assets/logiciels/illustrator.svg';
import indesign from '../assets/logiciels/indesign.svg';
import krita from '../assets/logiciels/krita.svg';
import photoshop from '../assets/logiciels/photoshop.svg';
import premierePro from '../assets/logiciels/premiere-pro.svg';
import paves from '../assets/jade/paves.jpg';
import portrait from '../assets/jade/portrait.jpg';

/** Photos de Jade. Sans `src`, un Placeholder s'affiche à la place. */
export const photos: Record<
  'portrait' | 'aPropos' | 'atelier',
  { src?: ImageMetadata; alt: string }
> = {
  // Haut de l'accueil
  portrait: {
    src: paves,
    alt: 'Jade, accroupie sur des pavés, lève les yeux vers l’objectif en souriant.',
  },
  // Haut de la page à propos
  aPropos: { src: portrait, alt: 'Portrait de Jade, souriante, en pull à motifs.' },
  // Provisoire : photo de l'ancien site, en attendant une vraie photo « à l'atelier ».
  atelier: { src: atelier, alt: 'Jade, souriante, tient son affiche du Doudou 2026.' },
};

export const site = {
  nom: 'Jade Deschuyteneer',
  nomCourt: 'Jade D.',
  age: '24 ans',
  email: import.meta.env.PUBLIC_CONTACT_EMAIL || 'deschuyteneerjade@gmail.com',
  /** Point d'envoi du formulaire (Formspree de Jade) ; PUBLIC_FORM_ENDPOINT le remplace si définie. */
  formulaire: import.meta.env.PUBLIC_FORM_ENDPOINT || 'https://formspree.io/f/meaaooyr',
  reseaux: {
    instagram: 'https://www.instagram.com/design_by_jade_/',
    instagramPseudo: '@design_by_jade_',
    linkedin: 'https://www.linkedin.com/in/jade-deschuyteneer-255718251/',
  },
} as const;

export type NavId = 'projets' | 'a-propos' | 'contact';

/** Liens de l'en-tête (desktop) ; le dernier est en Dymo d'accent. */
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

/** Accueil : hero « rangement ». */
export const hero = {
  prenom: 'JADE',
  nom: 'DESCHUYTENEER',
  role: 'Graphiste · motion designer',
  texte:
    'Je bidouille, j’explore et je construis des images depuis que je suis capable de tenir un crayon. Bienvenue sur mon établi.',
  boutonProjets: 'Mes projets ↓',
  boutonAPropos: 'Qui suis-je ?',
  postIt: ['à faire :', 'ranger le bureau'],
  indiceScroll: '↓ fais défiler — je range un peu avant les projets',
} as const;

/** Photo retournable du hero. */
export const photo = {
  legende: 'c’est moi, Jade !',
  retourner: '↺ retourne-moi',
  retournerTactile: '↺ touche-moi',
  ariaRecto: 'Retourner la photo pour lire le mot au dos',
  ariaVerso: 'Retourner la photo côté portrait',
  dos: {
    titre: 'Salut !',
    lignes: [
      'Jade, 24 ans. Graphiste & motion designer.',
      'Je bidouille, j’explore et je construis des images depuis que je sais tenir un crayon.',
    ],
    retourner: '↺ clique pour retourner',
  },
} as const;

/** Accueil : section projets (le sommaire est calculé). */
export const sectionProjets = {
  titre: 'MES PROJETS',
  sommaire: 'Sommaire',
  sommaireOuvrir: 'ouvrir ▼',
  sommaireFermer: 'fermer ▲',
  voirProjet: 'Voir le projet →',
  ouvrirProjet: 'Ouvrir le projet',
} as const;

/** Accueil : à propos court. */
export const aProposCourt = {
  etiquette: 'À propos',
  titre: 'Salut, moi c’est Jade.',
  paragraphes: [
    'Je travaille entre le design graphique et le motion design, avec une affection particulière pour les projets qui ont du rythme, du caractère et une petite étincelle en plus.',
    'En bref, je crée des visuels qui cherchent à être à la fois clairs, vivants et un peu inattendus.',
  ],
  lireLaSuite: 'Lire la suite →',
  photo: 'photo : Jade à l’atelier',
} as const;

/** Accroche de contact (accueil, à propos, contact). */
export const contactCourt = {
  etiquette: 'Contact',
  phrase: 'Votre message pourrait être le début d’une belle collaboration.',
  bouton: 'M’écrire →',
} as const;

/** Page à propos. */
export const aPropos = {
  etiquette: 'À propos',
  salut: 'SALUT,',
  moi: 'moi c’est Jade.',
  role: 'Graphiste · motion designer',
  bio: [
    'Je m’appelle Jade Deschuyteneer, j’ai 24 ans, et ==je bidouille, j’explore et je construis des images depuis que je suis capable de tenir un crayon.== L’art a toujours été mon terrain de jeu, un espace où je teste, j’expérimente et je transforme des idées en formes, en couleurs et en mouvement.',
    'Je travaille entre le design graphique et le motion design, avec une affection particulière pour les projets qui ont ==du rythme, du caractère et une petite étincelle en plus.== J’aime quand une image raconte quelque chose sans trop en dire, quand une identité visuelle trouve son ton juste, ou quand une animation donne vraiment vie à un univers.',
    'Mon approche mélange instinct, curiosité et précision : je passe facilement d’un logo à une vidéo animée, d’un univers ludique à quelque chose de plus conceptuel. En bref, je crée des visuels qui cherchent à être à la fois ==clairs, vivants et un peu inattendus.==',
  ],
  ceQueJeFais: {
    titre: 'Ce que je fais',
    note: 'deux casquettes, un même établi',
    projetsLies: 'Projets liés',
    // `projets` : slugs (noms de fichiers dans src/content/projets/).
    cartes: [
      {
        titre: 'Design graphique',
        texte:
          'Identités visuelles, logos, affiches et mise en page — trouver le ton juste d’une marque ou d’un univers.',
        projets: ['rituel', 'nogozone', 'doudou-illustre'],
      },
      {
        titre: 'Motion design',
        texte:
          'Vidéos animées et animations pour installations — donner du rythme et vraiment donner vie à un univers.',
        projets: ['tamagotchi-paradise', 'repetition-critique', 'nogozone'],
      },
    ],
  },
  parcours: {
    titre: 'Parcours',
    note: 'à mesurer à la règle',
    voirProgramme: 'Voir le programme',
    // Repris de l'image « Parcours » de l'ancien site ; années à compléter.
    // `lien` : page du programme d'études sur le site de l'école, à valider par Jade.
    etapes: [
      {
        annee: undefined,
        ecole: 'St-Luc Mons',
        diplome: 'Secondaire',
        detail: 'Option art',
        lien: 'https://www.istl.be/arts-plastiques',
      },
      {
        annee: undefined,
        ecole: 'Arts²',
        diplome: 'Bachelier',
        detail: 'Architecture d’intérieur',
        lien: 'https://www.artsaucarre.be/arts-visuels/options/architecture-dinterieur/presentation-de-loption/',
      },
      {
        annee: undefined,
        ecole: 'HELHa',
        diplome: 'Bachelier',
        detail: 'Publicité',
        lien: 'https://www.helha.be/etude/arts-appliques-2/publicite/cours-de-publicite/',
      },
    ],
  },
  // Repris des images « Logiciels » et « Langues » de l'ancien site. Anglais : niveau à ajouter après
  // le test de Jade ; il s'affiche dès qu'on remplit `niveau`.
  logiciels: {
    titre: 'Logiciels',
    liste: [
      { nom: 'Illustrator', logo: illustrator },
      { nom: 'InDesign', logo: indesign },
      { nom: 'Photoshop', logo: photoshop },
      { nom: 'Premiere Pro', logo: premierePro },
      { nom: 'After Effects', logo: afterEffects },
      { nom: 'Figma', logo: figma },
      { nom: 'Krita', logo: krita },
    ],
  },
  langues: {
    titre: 'Langues',
    liste: [
      { langue: 'Français', niveau: 'Langue maternelle' },
      { langue: 'Anglais', niveau: undefined },
    ],
  },
  // CV : déposer le PDF dans public/ et indiquer son chemin (ex. '/cv-jade-deschuyteneer.pdf').
  // Tant que `fichier` est vide, le bouton n'apparaît pas.
  cv: { fichier: undefined as string | undefined, libelle: 'Télécharger mon CV' },
  voirProjets: 'Voir mes projets',
} as const;

/** Page contact. */
export const contact = {
  phrase: 'Votre message pourrait être le début d’une belle collaboration.',
  sousTitre: 'N’hésitez pas à me contacter.',
  ailleurs: 'Ailleurs sur le web',
  emailDirect: 'E-mail direct :',
} as const;

/** Formulaire de contact. */
export const formulaire = {
  titre: 'Un petit mot',
  champs: {
    prenom: 'Prénom',
    nom: 'Nom',
    email: 'E-mail',
    message: 'Message',
  },
  erreurs: {
    prenom: '↑ votre prénom, s’il vous plaît',
    email: '↑ il me faut un e-mail valide pour vous répondre',
    message: '↑ et votre message ?',
  },
  obligatoires: '* Champ obligatoire',
  envoyer: 'Envoyer le message →',
  envoi: 'Envoi…',
  tampon: 'ENVOYÉ',
  tamponMerci: 'merci !',
  confirmation: 'Votre message est bien parti. Je vous réponds dès que possible.',
  autreMessage: 'Envoyer un autre message',
  // Absents des maquettes : à valider par Jade.
  echec: 'Le message n’a pas pu partir. Vous pouvez m’écrire directement à',
  sansFormulaire: 'Pour m’écrire, le plus simple est l’e-mail :',
} as const;

/** Page projet : libellés d'interface. */
export const pageProjet = {
  retour: '← Retour à l’établi',
  retourCourt: '← Établi',
  leProjet: 'Le projet',
  ficheTechnique: 'Fiche technique',
  fiche: {
    projet: 'Projet',
    type: 'Type',
    supports: 'Supports',
    logiciels: 'Logiciels',
  },
  glisse: '← glisse →',
  // Absents des maquettes : à valider par Jade.
  agrandir: 'Agrandir l’image',
  imageAgrandie: 'Image agrandie',
  imagePrecedente: 'Image précédente',
  imageSuivante: 'Image suivante',
  fermer: 'Fermer',
  videoPause: 'Pause',
  videoLecture: 'Lecture',
  videoSonActiver: 'Activer le son',
  videoSonCouper: 'Couper le son',
  ceQueJenRetiens: 'Ce que j’en retiens',
  projetSuivant: 'Projet suivant',
  tousLesProjets: '← Tous les projets',
  aCompleter: '[ à compléter ]',
} as const;

/** Page 404. */
export const page404 = {
  titre: '404',
  phrase: 'Oups — cette page a glissé sous le bureau.',
  texte: 'Elle a peut-être été rangée ailleurs. Le plus simple : revenir sur l’établi.',
  retour: '← Retour à l’établi',
  prevenir: 'Me prévenir',
} as const;
