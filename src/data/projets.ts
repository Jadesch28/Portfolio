// Accès aux projets : tri, URL, numérotation, projet suivant.
import { getCollection, type CollectionEntry } from 'astro:content';

export type Projet = CollectionEntry<'projets'>;

/** Un visuel des données : sans `src`, il s'affiche en Placeholder libellé avec `alt`. */
export type Visuel = NonNullable<Projet['data']['visuelPrincipal']>;
export type Bloc = Projet['data']['blocs'][number];

/** Tous les projets, triés par `numero`. Refuse deux projets avec le même numéro. */
export async function getProjets(): Promise<Projet[]> {
  const projets = (await getCollection('projets')).sort((a, b) => a.data.numero - b.data.numero);

  projets.forEach((projet, i) => {
    const precedent = projets[i - 1];
    if (precedent && precedent.data.numero === projet.data.numero) {
      throw new Error(
        `Deux projets ont le numéro ${projet.data.numero} : « ${precedent.id} » et « ${projet.id} ».`,
      );
    }
  });

  return projets;
}

export const projetHref = (projet: Projet) => `/projets/${projet.id}`;

/** 1 → « 01 » : compteurs, carnet, étiquettes Dymo. */
export const deuxChiffres = (n: number) => String(n).padStart(2, '0');

/** Projet suivant dans l'ordre, avec retour au premier après le dernier. */
export function projetSuivant(projets: Projet[], courant: Projet): Projet {
  const i = projets.findIndex((p) => p.id === courant.id);
  return projets[(i + 1) % projets.length] ?? courant;
}
