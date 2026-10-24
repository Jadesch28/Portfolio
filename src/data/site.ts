// Petits textes éditables du site.
// Les longs textes (bio, phrases d'accroche) viennent mot pour mot de l'ancien site WordPress ;
// les phrases manuscrites et les textes d'interface viennent des maquettes : à faire valider par Jade.
// Dans `bio`, les passages entre ==…== sont surlignés au scroll.
import type { ImageMetadata } from 'astro';
import atelier from '../assets/jade/atelier.jpg';

/** Photos de Jade. Sans `src`, un Placeholder s'affiche à la place. */
export const photos: Record<'portrait' | 'atelier', { src?: ImageMetadata; alt: string }> = {
  // À fournir : portrait vertical 4:5 en haute définition (src/assets/jade/portrait.jpg).
  portrait: { alt: 'photo de Jade — portrait' },
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

/** Accueil : hero « rangement ». */
export const hero = {
  prenom: 'JADE',
  nom: 'DESCHUYTENEER',
  role: 'Graphiste · motion designer',
  roleSuite: '& illustratrice',
  texte:
    'Je bidouille, j’explore et je construis des images depuis que je suis capable de tenir un crayon. Bienvenue sur mon établi.',
  boutonProjets: 'Mes projets ↓',
  boutonAPropos: 'Qui suis-je ?',
  postIt: ['à faire :', 'ranger le bureau'],
  indiceScroll: '↓ fais défiler — je range un peu avant les projets',
  range: 'voilà, c’est rangé. place aux projets ↓',
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
      'Jade, 24 ans. Graphiste, motion designer & illustratrice.',
      'Je bidouille, j’explore et je construis des images depuis que je sais tenir un crayon.',
    ],
    retourner: '↺ clique pour retourner',
  },
} as const;

/** Accueil : section projets (le compteur et le sommaire sont calculés). */
export const sectionProjets = {
  compteur: 'projets',
  titre: 'MES PROJETS',
  note: 'le carnet suit ta lecture — clique sur un titre pour y aller, sur une image pour ouvrir le projet.',
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
    'Je travaille entre le design graphique, le motion design et l’illustration, avec une affection particulière pour les projets qui ont du rythme, du caractère et une petite étincelle en plus.',
    'En bref, je crée des visuels qui cherchent à être à la fois clairs, vivants et un peu inattendus.',
  ],
  lireLaSuite: 'Lire la suite →',
  photo: 'photo : Jade à l’atelier',
} as const;

/** Accroche de contact (accueil, à propos, contact). */
export const contactCourt = {
  etiquette: 'Contact',
  phrase: 'Votre message pourrait être le début d’un beau projet.',
  bouton: 'Écrire à Jade →',
} as const;

/** Page à propos. */
export const aPropos = {
  etiquette: 'À propos',
  salut: 'SALUT,',
  moi: 'moi c’est Jade.',
  role: 'Graphiste · motion designer · illustratrice',
  postIt: 'j’aime : la papeterie, le scrapbooking & l’automne',
  bio: [
    'Je m’appelle Jade Deschuyteneer, j’ai 24 ans, et ==je bidouille, j’explore et je construis des images depuis que je suis capable de tenir un crayon.== L’art a toujours été mon terrain de jeu, un espace où je teste, j’expérimente et je transforme des idées en formes, en couleurs et en mouvement.',
    'Je travaille entre le design graphique, le motion design et l’illustration, avec une affection particulière pour les projets qui ont ==du rythme, du caractère et une petite étincelle en plus.== J’aime quand une image raconte quelque chose sans trop en dire, quand une identité visuelle trouve son ton juste, ou quand une animation donne vraiment vie à un univers.',
    'Mon approche mélange instinct, curiosité et précision : je passe facilement d’un logo à une vidéo animée, d’un univers ludique à quelque chose de plus conceptuel. En bref, je crée des visuels qui cherchent à être à la fois ==clairs, vivants et un peu inattendus.==',
  ],
  ceQueJeFais: {
    titre: 'Ce que je fais',
    note: 'trois casquettes, un même établi',
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
        projets: ['tamagotchi-paradise', 'repetition-critique'],
      },
      {
        titre: 'Illustration',
        texte:
          'Illustrations au trait, affiches illustrées et cartes de jeu — des images qui racontent sans trop en dire.',
        projets: ['rituel', 'doudou-illustre'],
      },
    ],
  },
  parcours: {
    titre: 'Parcours',
    note: 'à mesurer à la règle',
    // Repris de l'image « Parcours » de l'ancien site ; années à compléter.
    etapes: [
      { annee: undefined, ecole: 'St-Luc Mons', diplome: 'Secondaire', detail: 'Option art' },
      {
        annee: undefined,
        ecole: 'Arts²',
        diplome: 'Bachelier',
        detail: 'Architecture d’intérieur',
      },
      { annee: undefined, ecole: 'HELHa', diplome: 'Bachelier', detail: 'Publicité' },
    ],
  },
  // Repris des images « Logiciels » et « Langues » de l'ancien site ; niveaux de langue à compléter.
  logiciels: {
    titre: 'Logiciels',
    liste: ['Illustrator', 'Photoshop', 'After Effects', 'Premiere Pro', 'InDesign'],
  },
  langues: {
    titre: 'Langues',
    liste: [
      { langue: 'Français', niveau: undefined },
      { langue: 'Anglais', niveau: undefined },
    ],
  },
  voirProjets: 'Voir ses projets',
} as const;

/** Page contact. */
export const contact = {
  phrase: 'Votre message pourrait être le début d’un beau projet.',
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
    prenom: '↑ ton prénom, s’il te plaît',
    email: '↑ il me faut un e-mail valide pour te répondre',
    message: '↑ et ton message ?',
  },
  obligatoires: 'Tous les champs sauf « Nom » sont obligatoires.',
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
  projet: 'Projet',
  leProjet: 'Le projet',
  ficheTechnique: 'Fiche technique',
  fiche: {
    projet: 'Projet',
    type: 'Type',
    supports: 'Supports',
    disciplines: 'Disciplines',
    annee: 'Année',
    contexte: 'Contexte',
    outils: 'Outils',
  },
  glisse: '← glisse →',
  // Absents des maquettes : à valider par Jade.
  videoPause: 'Pause',
  videoLecture: 'Lecture',
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
