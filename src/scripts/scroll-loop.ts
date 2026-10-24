// Une seule boucle de scroll pour tout le site : un écouteur passif + requestAnimationFrame.
// Chaque effet s'abonne avec surScroll() : il mesure (lectures du DOM) et renvoie, s'il y a lieu,
// une fonction d'écriture. Toutes les lectures passent avant toutes les écritures, pour éviter
// les recalculs de mise en page forcés.

export type Mesures = { scrollY: number; vw: number; vh: number };
type Ecriture = () => void;
type Abonne = (mesures: Mesures) => Ecriture | undefined;

const abonnes = new Set<Abonne>();
let image = 0;
let branche = false;

const tick = () => {
  image = 0;
  const mesures = { scrollY: window.scrollY, vw: window.innerWidth, vh: window.innerHeight };
  const ecritures: Ecriture[] = [];
  abonnes.forEach((abonne) => {
    const ecrire = abonne(mesures);
    if (ecrire) ecritures.push(ecrire);
  });
  ecritures.forEach((ecrire) => ecrire());
};

const demander = () => {
  if (!image) image = requestAnimationFrame(tick);
};

/** Abonne un effet au scroll (et au redimensionnement). Renvoie la fonction de désabonnement. */
export function surScroll(abonne: Abonne): () => void {
  abonnes.add(abonne);
  if (!branche) {
    window.addEventListener('scroll', demander, { passive: true });
    window.addEventListener('resize', demander, { passive: true });
    branche = true;
  }
  demander();
  return () => abonnes.delete(abonne);
}

export const mouvementReduit = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const borner = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
