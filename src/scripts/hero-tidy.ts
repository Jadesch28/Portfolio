// Hero « rangement » : le bureau se range au fil du scroll (≥ 760 px, hors mouvement réduit).
// p = progression dans la scène (0 = désordre, 1 = rangé). Chaque objet interpole de sa pose
// « désordre » (--x0, --y0, --r0) vers sa pose « rangée » (--x1, --y1, --r1), décalé de 0,03 par objet.
import { borner, mouvementReduit, surScroll } from './scroll-loop';

const scene = document.querySelector<HTMLElement>('[data-hero-tidy]');
const stage = scene?.querySelector<HTMLElement>('.stage');

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

if (scene && stage && !mouvementReduit()) {
  const lire = (el: HTMLElement, nom: string) =>
    parseFloat(getComputedStyle(el).getPropertyValue(nom)) || 0;

  const objets = [...scene.querySelectorAll<HTMLElement>('.ko')].map((el) => ({
    el,
    portrait: el.dataset.objet === 'portrait',
    index: Number(getComputedStyle(el).getPropertyValue('--i')) || 0,
    x0: lire(el, '--x0'),
    y0: lire(el, '--y0'),
    r0: lire(el, '--r0'),
    x1: lire(el, '--x1'),
    y1: lire(el, '--y1'),
    r1: lire(el, '--r1'),
  }));
  const termine = scene.querySelector<HTMLElement>('.done');
  let derniere = -1;

  surScroll(({ vw }) => {
    // Sous 760 px, la scène est empilée par le CSS : rien à calculer.
    if (vw < 760) {
      derniere = -1;
      return;
    }

    const rect = scene.getBoundingClientRect();
    const stageH = stage.offsetHeight;
    const distance = rect.height - stageH;
    const p = distance > 0 ? borner(-rect.top / distance) : 0;
    if (p === derniere) return;
    derniere = p;

    // Échelle des objets : min(largeur / 1440, hauteur / 900), bornée à [0,55 ; 1].
    scene.style.setProperty('--sc', String(borner(Math.min(vw / 1440, stageH / 900), 0.55, 1)));
    scene.style.setProperty('--p', p.toFixed(3));

    objets.forEach((o) => {
      const e = o.portrait ? ease(borner(p / 0.9)) : ease(borner((p - o.index * 0.03) / 0.8));
      const style = o.el.style;
      style.setProperty('--x', lerp(o.x0, o.x1, e).toFixed(2));
      style.setProperty('--y', lerp(o.y0, o.y1, e).toFixed(2));
      style.setProperty('--r', lerp(o.r0, o.r1, e).toFixed(2));
      style.setProperty('--s', lerp(1, o.portrait ? 1.02 : 0.9, e).toFixed(3));
    });

    // « voilà, c'est rangé » : visible à partir de 75 %, cliquable au-delà de 80 %.
    if (termine) {
      const opacite = borner((p - 0.75) * 4);
      termine.style.opacity = opacite.toFixed(3);
      termine.style.visibility = opacite > 0 ? 'visible' : 'hidden';
      termine.style.pointerEvents = p > 0.8 ? 'auto' : 'none';
    }
  });
}
