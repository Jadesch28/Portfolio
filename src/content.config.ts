// Collection « projets » : un fichier Markdown par projet dans src/content/projets/.
// Le slug (URL /projets/<slug>) est le nom du fichier. Le corps du Markdown = la section « Le projet ».
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projets = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projets' }),
  schema: ({ image }) => {
    // Un visuel. Sans `src`, le site affiche un Placeholder hachuré libellé avec `alt`.
    const visuel = z.object({
      src: image().optional(),
      alt: z.string(),
      legende: z.string().optional(),
    });

    const bloc = z.discriminatedUnion('type', [
      z.object({
        type: z.literal('galerie'),
        titre: z.string(),
        note: z.string().optional(),
        images: z.array(visuel).min(1),
      }),
      z.object({
        type: z.literal('cartes'),
        titre: z.string(),
        note: z.string().optional(),
        images: z.array(visuel).min(1),
      }),
      z.object({
        type: z.literal('texte'),
        titre: z.string(),
        // Paragraphes séparés par une ligne vide.
        texte: z.string(),
        // Visuels d'accompagnement (ex. spécimen typo de Rituel).
        images: z.array(visuel).optional(),
      }),
      z.object({
        type: z.literal('palette'),
        // Sans titre, la palette se rattache au bloc précédent (pas de numéro).
        titre: z.string().optional(),
        couleurs: z
          .array(z.object({ nom: z.string(), hex: z.string().regex(/^#[0-9a-fA-F]{6}$/) }))
          .min(1),
      }),
      z.object({
        type: z.literal('citation'),
        texte: z.string(),
      }),
      // Section propre à un projet : composant src/components/sur-mesure/<composant>.astro.
      z.object({
        type: z.literal('sur-mesure'),
        composant: z.string().regex(/^[A-Z][A-Za-z0-9]*$/),
        titre: z.string().optional(),
        note: z.string().optional(),
        /** Données libres transmises au composant. */
        donnees: z.record(z.string(), z.unknown()).optional(),
      }),
    ]);

    return z.object({
      /** Ordre d'affichage (1, 2, 3…). */
      numero: z.number().int().positive(),
      titre: z.string(),
      /** Pour les étiquettes Dymo et le carnet. */
      titreCourt: z.string(),
      categorie: z.string(),
      /** 2–3 lignes pour la carte de l'accueil. */
      resume: z.string(),
      /** Chapô du haut de la page projet. */
      intro: z.string(),
      /** Petite phrase manuscrite sous l'intro (ex. « ↓ on ouvre la boîte »). */
      annotation: z.string().optional(),
      annee: z.number().int().optional(),
      /** École, concours, client, perso… */
      contexte: z.string().optional(),
      supports: z.array(z.string()).optional(),
      disciplines: z.array(z.string()).optional(),
      outils: z.array(z.string()).optional(),
      visuelPrincipal: visuel.optional(),
      visuelSecondaire: visuel.optional(),
      /** Projets motion : la vidéo remplace le visuel principal (fichiers dans public/videos/). */
      video: z
        .object({
          mp4: z.string(),
          webm: z.string().optional(),
          // Par défaut : l'image du visuel principal.
          poster: image().optional(),
        })
        .optional(),
      blocs: z.array(bloc).default([]),
    });
  },
});

export const collections = { projets };
