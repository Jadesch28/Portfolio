# Portfolio de Jade Deschuyteneer

Site portfolio de Jade Deschuyteneer, graphiste, motion designer & illustratrice. Direction
artistique « L'établi » : un tapis de découpe vert, des étiquettes Dymo, du washi tape, des
polaroïds et un carnet à spirale.

- **Stack** : [Astro](https://astro.build) 7 en sortie statique, TypeScript strict, CSS natif,
  JavaScript vanilla (aucun framework côté navigateur).
- **Hébergement** : Vercel (offre gratuite Hobby), depuis le dépôt GitHub
  [Jadesch28/Portfolio](https://github.com/Jadesch28/Portfolio).
- **Maquettes de référence** : `design-reference/` (exports Claude Design) et le brief
  `PROMPT_CLAUDE_CODE.md`.

## Sommaire

1. [Lancer le projet](#lancer-le-projet)
2. [Ajouter un projet](#ajouter-un-projet)
3. [Remplacer un visuel en attente par une image](#remplacer-un-visuel-en-attente-par-une-image)
4. [Modifier les petits textes](#modifier-les-petits-textes)
5. [Le formulaire de contact](#le-formulaire-de-contact)
6. [Déployer sur Vercel](#déployer-sur-vercel)
7. [Brancher le domaine jadedeschuyteneer.be (OVH)](#brancher-le-domaine-jadedeschuyteneerbe-ovh)
8. [Contenus encore manquants](#contenus-encore-manquants)
9. [Pour aller plus loin](#pour-aller-plus-loin)

---

## Lancer le projet

Il faut [Node.js](https://nodejs.org) 22.

```bash
npm install
npm run dev
```

Le site tourne sur <http://localhost:4321>. Les modifications s'affichent en direct.

| Commande          | Rôle                                                                   |
| ----------------- | ---------------------------------------------------------------------- |
| `npm run dev`     | Serveur de développement                                               |
| `npm run build`   | Vérifie les types puis construit le site dans `dist/`                  |
| `npm run preview` | Sert le site construit, comme en ligne                                 |
| `npm run check`   | Vérification TypeScript / Astro                                        |
| `npm run lint`    | ESLint                                                                 |
| `npm run format`  | Prettier                                                               |
| `npm run shots`   | Captures 1440 et 390 px dans `.screenshots/` (serveur lancé)           |
| `npm run audit`   | Audit d'accessibilité axe sur toutes les pages (serveur lancé)         |
| `npm run og`      | Régénère l'image de partage et les favicons dans `public/` (dev lancé) |

En développement uniquement :

- <http://localhost:4321/styleguide> : tous les composants et leurs états, plus une fiche de
  relecture de chaque projet (ce qui manque y est signalé « [ à compléter ] ») ;
- <http://localhost:4321/og> : la source de l'image de partage et du favicon.

Ces deux pages n'existent pas sur le site en ligne.

---

## Ajouter un projet

Un projet = **un fichier Markdown** dans `src/content/projets/` et ses images dans
`src/assets/projets/<nom-du-projet>/`. La carte de l'accueil, le carnet sommaire, le compteur
« 05 projets », le menu mobile, le « projet suivant » et la page du projet se mettent à jour
tout seuls.

### 1. Créer le fichier

Le nom du fichier devient l'adresse de la page : `mon-projet.md` → `/projets/mon-projet`.
Minuscules, sans accents ni espaces (des tirets à la place).

### 2. Remplir l'en-tête

Copier ce modèle en haut du fichier et l'adapter :

```yaml
---
numero: 6 # ordre d'affichage (1 = premier)
titre: Mon projet
titreCourt: Mon projet # pour les étiquettes Dymo et le carnet
categorie: Affiche · illustration
resume: Deux ou trois lignes pour la carte de l'accueil.
intro: Une phrase d'accroche pour le haut de la page projet.
annotation: ↓ une petite phrase manuscrite (facultatif)
annee: 2026 # facultatif
contexte: École, concours, client, perso… # facultatif
supports: # facultatif
  - Affiche
  - Flyer
disciplines: # facultatif
  - Illustration
outils: # facultatif
  - Illustrator
visuelPrincipal:
  src: ../../assets/projets/mon-projet/visuel.jpg
  alt: Description de l'image pour les personnes qui ne la voient pas.
visuelSecondaire: # petit polaroïd « détail » (facultatif)
  src: ../../assets/projets/mon-projet/detail.jpg
  alt: Description du détail.
blocs:
  - type: galerie
    titre: Galerie
    images:
      - src: ../../assets/projets/mon-projet/image-1.jpg
        alt: Description de l'image 1.
        legende: une légende manuscrite (facultatif)
---
Le texte de la section « Le projet ». Le premier paragraphe est affiché en grand (chapô).

Les paragraphes suivants sont séparés par une ligne vide.
```

- Les champs **facultatifs** laissés vides n'apparaissent pas sur le site en ligne (en
  développement, ils sont signalés « [ à compléter ] »).
- Si deux projets ont le même `numero`, le build s'arrête avec un message clair.
- Un `alt` est obligatoire pour chaque image : c'est ce que lisent les lecteurs d'écran.

### 3. Ajouter les images

Les mettre dans `src/assets/projets/mon-projet/` (JPEG ou PNG, 2000 à 2500 px de large
suffisent). Le site les convertit tout seul en AVIF et WebP, à la bonne taille pour chaque écran.

### 4. Une vidéo (projets motion)

Mettre le fichier MP4 dans `public/videos/` puis ajouter dans l'en-tête :

```yaml
video:
  mp4: /videos/mon-projet.mp4
```

La vidéo remplace le visuel principal en haut de la page (le visuel principal sert d'image
d'attente). Elle est muette, tourne en boucle, ne se lance que quand elle est visible et
garde un bouton pause. **Viser 2 à 4 Mo** : exporter en 720p ou 1080p, H.264, débit modéré.

### 5. Les blocs de la page projet

La liste `blocs` décrit la page, dans l'ordre. Chaque bloc titré reçoit une étiquette numérotée
(« 01 — La boîte »).

| Type         | Champs                                     | Rendu                                                   |
| ------------ | ------------------------------------------ | ------------------------------------------------------- |
| `galerie`    | `titre`, `note`?, `images`                 | Tirages bordés en quinconce, scotchés                   |
| `cartes`     | `titre`, `note`?, `images`                 | Éventail de cartes de jeu (bande qui défile sur mobile) |
| `texte`      | `titre`, `texte`, `images`?                | Paragraphes, visuels d'accompagnement à droite          |
| `palette`    | `titre`?, `couleurs` (`nom`, `hex`)        | Nuancier ; sans titre, il se range à côté du texte      |
| `citation`   | `texte`                                    | « Ce que j'en retiens », en manuscrit                   |
| `sur-mesure` | `composant`, `titre`?, `note`?, `donnees`? | Une section écrite exprès pour ce projet (voir dessous) |

Exemple complet : `src/content/projets/rituel.md`.

### 6. Une section sur mesure

Pour un projet qui sort du cadre (une animation particulière, une mise en page à part…) :

1. copier `src/components/sur-mesure/Exemple.astro` sous un nouveau nom, par exemple
   `TamagotchiEcran.astro`, et y coder la section ;
2. l'appeler depuis le projet :

```yaml
blocs:
  - type: sur-mesure
    composant: TamagotchiEcran
    titre: L'écran
    donnees: { couleur: '#E2B655' }
```

Le composant reçoit le projet, l'étiquette numérotée, la note et les `donnees`. Le haut de la
page, la fiche technique et le « projet suivant » restent communs à tous les projets (ce sont
eux qui portent la transition depuis l'accueil).

### 7. Vérifier

```bash
npm run dev
```

Ouvrir l'accueil, la page du projet et <http://localhost:4321/styleguide> (fiche « Contenu »).
Puis `npm run build` doit passer sans erreur.

---

## Remplacer un visuel en attente par une image

Un visuel sans image s'affiche comme un bloc hachuré libellé (« [ carte 1 ] »).

- **Dans un projet** : mettre l'image dans `src/assets/projets/<projet>/` et ajouter la ligne
  `src:` au-dessus de son `alt`. Par exemple, dans `rituel.md` :

  ```yaml
  images:
    - src: ../../assets/projets/rituel/carte-1.jpg
      alt: Carte 1 du jeu Rituel, …
  ```

- **Photos de Jade** (portrait du haut de l'accueil et de l'à propos, photo « à l'atelier ») :
  dans `src/data/site.ts`, objet `photos`. Pour le portrait, déposer
  `src/assets/jade/portrait.jpg` (vertical 4:5), puis :

  ```ts
  import portrait from '../assets/jade/portrait.jpg';
  // …
  portrait: { src: portrait, alt: 'Portrait de Jade…' },
  ```

---

## Modifier les petits textes

Tous les textes d'interface sont dans **`src/data/site.ts`** : phrases manuscrites (« c'est moi,
Jade ! », le post-it, le mot au dos de la photo…), libellés de navigation, textes de l'à propos
(bio, « Ce que je fais », parcours, logiciels, langues), messages du formulaire, page 404,
liens Instagram et LinkedIn, adresse e-mail.

Dans la bio, les passages entre `==…==` sont surlignés au scroll.

---

## Le formulaire de contact

Les messages partent vers le [Formspree](https://formspree.io) de Jade
(`https://formspree.io/f/meaaooyr`, réglé dans `src/data/site.ts`, champ `formulaire`) et
arrivent par e-mail chez elle.

- Validation dans le navigateur (prénom, e-mail valide, message), tampon « ENVOYÉ » en cas de
  succès, message avec l'adresse e-mail en cas d'échec.
- Un champ caché piège les robots (`_gotcha`, reconnu par Formspree).
- Pour changer de service sans toucher au code : variable d'environnement
  `PUBLIC_FORM_ENDPOINT` (voir `.env.example`), puis redéployer.
- À la première réception, Formspree peut demander de confirmer l'adresse : suivre le lien
  reçu par e-mail.

---

## Déployer sur Vercel

Le site est entièrement statique : Vercel construit les pages une fois, puis les sert depuis son
réseau. Pas de serveur, pas de base de données.

### Première mise en ligne

1. Créer un compte sur [vercel.com](https://vercel.com) **avec le compte GitHub de Jade**
   (`Jadesch28`), offre **Hobby** (gratuite, pour un usage personnel non commercial).
2. **Add New… → Project**, choisir le dépôt `Jadesch28/Portfolio`, puis **Import**.
3. Vercel reconnaît Astro tout seul. Ne rien changer : la commande de build vient de
   `package.json`, le dossier publié est `dist`, la version de Node (22) vient de `engines`.
4. Aucune variable d'environnement n'est obligatoire. Facultatives (**Settings → Environment
   Variables**) : `SITE_URL`, `PUBLIC_FORM_ENDPOINT`, `PUBLIC_CONTACT_EMAIL`.
5. **Deploy**. Le site est en ligne sur une adresse en `….vercel.app`.

### Ensuite

- Chaque envoi sur la branche `main` met le site en ligne à jour.
- Chaque autre branche reçoit sa propre adresse d'aperçu, pour tester sans toucher au site.
- Si un build échoue (par exemple un projet mal rempli), le site en ligne reste sur la version
  précédente : le message d'erreur est dans l'onglet **Deployments**.

`vercel.json` règle les adresses propres (`/a-propos` sans `.html`) et le cache des fichiers.

---

## Brancher le domaine jadedeschuyteneer.be (OVH)

Aujourd'hui, le nom de domaine et l'ancien site WordPress sont chez OVH. On garde le **nom de
domaine chez OVH** (il continue d'être renouvelé là-bas) et on fait pointer son adresse vers
Vercel. À faire **quand le nouveau site est prêt** : dès le changement, l'ancien site n'est
plus visible à cette adresse.

### Avant de commencer

- Noter si Jade a une adresse e-mail en `@jadedeschuyteneer.be`. Si oui, ses enregistrements
  **MX** (et TXT/SPF) ne doivent surtout pas être touchés.
- Faire une sauvegarde de la zone DNS : dans l'espace client OVH, la zone DNS propose de
  l'exporter (ou faire une capture de toutes les lignes).

### 1. Ajouter le domaine dans Vercel

Projet → **Settings → Domains → Add** : saisir `jadedeschuyteneer.be`, puis
`www.jadedeschuyteneer.be`. Quand Vercel propose une redirection, choisir **`jadedeschuyteneer.be`
(sans www) comme domaine principal** et rediriger `www` vers lui : c'est l'adresse que le site
utilise pour ses liens canoniques, son sitemap et son image de partage. (Pour préférer le `www`,
définir la variable `SITE_URL=https://www.jadedeschuyteneer.be` dans Vercel.)

Vercel affiche alors, pour chacun, **l'enregistrement à créer**, par exemple :

| Domaine                    | Type  | Valeur                                             |
| -------------------------- | ----- | -------------------------------------------------- |
| `jadedeschuyteneer.be`     | A     | une adresse IP donnée par Vercel                   |
| `www.jadedeschuyteneer.be` | CNAME | une cible en `….vercel-dns-….com` propre au projet |

**Recopier exactement les valeurs affichées par Vercel** : elles dépendent du projet, et les
valeurs trouvées dans d'anciens tutoriels (`76.76.21.21`, `cname.vercel-dns.com`) peuvent ne
plus être les bonnes.

### 2. Modifier la zone DNS chez OVH

Espace client OVHcloud → **Web Cloud → Noms de domaine → jadedeschuyteneer.be → Zone DNS** :

1. **Domaine nu** (sous-domaine vide) : modifier l'enregistrement **A** existant (il pointe
   aujourd'hui vers l'hébergement OVH) et mettre l'adresse donnée par Vercel. Supprimer un
   éventuel enregistrement **AAAA** sur le domaine nu (Vercel ne gère pas l'IPv6 dans ce cas).
2. **www** : supprimer l'ancien enregistrement `www` (A ou CNAME), puis créer un **CNAME** `www`
   vers la cible donnée par Vercel (OVH ajoute parfois un point final, c'est normal).
3. Ne pas toucher aux **MX**, **TXT** (SPF, vérifications) ni aux autres sous-domaines.

### 3. Attendre et vérifier

- La propagation prend de quelques minutes à quelques heures (jusqu'à 48 h au pire).
- Dans **Settings → Domains**, Vercel passe les domaines en « Valid Configuration » et crée
  tout seul le certificat HTTPS.
- Les liens canoniques, le sitemap et l'image de partage utilisent ensuite automatiquement le
  domaine (Vercel fournit `VERCEL_PROJECT_PRODUCTION_URL`, le plus court des domaines du projet) :
  redéployer une fois pour en être sûr (**Deployments → … → Redeploy**).

### 4. Après coup

- L'hébergement WordPress chez OVH peut être résilié **quand tout fonctionne** (en gardant le
  nom de domaine et, le cas échéant, l'offre e-mail).
- Dans [Google Search Console](https://search.google.com/search-console), ajouter le site et
  soumettre `https://jadedeschuyteneer.be/sitemap.xml`. Les anciennes adresses WordPress
  (`?p=561`…) disparaîtront d'elles-mêmes de Google.

---

## Contenus encore manquants

Ce qui est en attente ou à faire valider par Jade (rien n'a été inventé : les longs textes
viennent mot pour mot de l'ancien site, les phrases courtes viennent des maquettes).

**Photos**

- Portrait de Jade (vertical 4:5, haute définition) pour l'accueil et l'à propos.
- Photo « à l'atelier » : provisoirement, la photo de Jade avec son affiche du Doudou.

**Projets**

- Année, outils et (pour Rituel, Tamagotchi, NogoZone) contexte de chaque projet.
- Rituel : les 5 cartes et leur dos commun, le spécimen typographique, les runes et icônes de
  cartes, la face arrière de la boîte en image séparée (aujourd'hui un seul visuel montre les
  deux faces).
- Rituel : confirmer les couleurs du nuancier (relevées sur le visuel de la boîte : noir
  `#0B0A0C`, beige `#DBCAA9`, rouge sang `#7B311B`).
- Visuels secondaires (« détail ») de Tamagotchi Paradise et de Répétition critique.
- Vidéos plus légères (Tamagotchi Paradise pèse 11 Mo ; viser 2 à 4 Mo).

**À propos**

- Années du parcours, niveaux de langue.

**Textes à valider**

- Les résumés des cartes et les intros des pages projet (condensés dans les maquettes à partir
  des textes de l'ancien site).
- Les phrases manuscrites et textes d'interface de `src/data/site.ts`, dont ceux absents des
  maquettes : bouton « Pause / Lecture » des vidéos, message d'échec du formulaire.
- Les textes alternatifs des images (dans chaque fichier projet).

---

## Pour aller plus loin

### Organisation du code

```
src/
  content.config.ts        schéma des projets (ce qui est obligatoire ou non)
  content/projets/*.md     un fichier par projet
  assets/                  images (optimisées au build)
  data/site.ts             petits textes, photos de Jade, liens, formulaire
  data/projets.ts          tri, numérotation, projet suivant
  data/seo.ts              données structurées pour les moteurs de recherche
  layouts/Base.astro       <head>, polices, en-tête, pied de page, transitions
  components/              composants (Dymo, polaroïd, carnet, blocs…)
  components/blocs/        blocs des pages projet
  components/sur-mesure/   sections propres à un projet
  pages/                   pages du site, sitemap.xml, robots.txt
  scripts/                 animations (une seule boucle de scroll), formulaire, vidéos
  styles/                  tokens, base, animations, transitions
  dev/                     styleguide et image de partage (développement seulement)
public/                    vidéos, favicons, image de partage
design-reference/          maquettes Claude Design (référence visuelle)
```

### Animations et accessibilité

- Une seule boucle de scroll (`src/scripts/scroll-loop.ts`) ; seules la position, la rotation,
  l'échelle et l'opacité sont animées.
- Avec le réglage « réduire les animations », le bureau est déjà rangé, il n'y a ni parallaxe
  ni vol de photo, et les entrées deviennent de simples fondus.
- Sans JavaScript, tout le contenu reste visible.
- La transition « la photo vole vers la page projet » utilise la View Transitions API (Chrome,
  Edge, Safari récents) ; ailleurs, la navigation reste classique.

### Qualité (au 24 octobre 2026)

- Lighthouse mobile : 98 / 100 / 100 / 100 sur l'accueil et sur Rituel.
- axe-core : aucun problème sur les 9 pages, en desktop et en mobile.
