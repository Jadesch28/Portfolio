// Une seule boucle de scroll pour tout le site : un écouteur passif + requestAnimationFrame.
// Chaque effet s'abonne avec surScroll() et reçoit les mesures du cadre courant.

export type Mesures = { scrollY: number; vw: number; vh: number };
type Abonne = (mesures: Mesures) => void;

const abonnes = new Set<Abonne>();
let image = 0;
let branche = false;

const tick = () => {
  image = 0;
  const mesures = { scrollY: window.scrollY, vw: window.innerWidth, vh: window.innerHeight };
  abonnes.forEach((abonne) => abonne(mesures));
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
