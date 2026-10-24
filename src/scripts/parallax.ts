// Parallaxe : q = (centre de l'élément − milieu de l'écran) / hauteur d'écran, borné à [−1, 1],
// puis translateY(q × facteur px). [data-parallax="-60"] sur les petits polaroïds des cartes,
// "-40" sur les galeries de la page projet. [data-parallax-hero] : visuel du hero projet,
// translateY(min(120, scrollY × 0,18) px). Rien avec un mouvement réduit ni sous 760 px.
import { borner, mouvementReduit, surScroll } from './scroll-loop';

const elements = [...document.querySelectorAll<HTMLElement>('[data-parallax]')];
const heros = [...document.querySelectorAll<HTMLElement>('[data-parallax-hero]')];

if (!mouvementReduit() && elements.length + heros.length > 0) {
  surScroll(({ scrollY, vw, vh }) => {
    const actif = vw >= 760;

    // Lectures : position de chaque élément, sans la translation déjà appliquée.
    const positions = elements.map((el) => {
      if (!actif) return '';
      const r = el.getBoundingClientRect();
      const centre = r.top - Number(el.dataset.parallaxY ?? 0) + r.height / 2;
      const q = borner((centre - vh / 2) / vh, -1, 1);
      return (q * Number(el.dataset.parallax)).toFixed(1);
    });
    const hero = actif ? `translateY(${Math.min(120, scrollY * 0.18).toFixed(1)}px)` : '';

    // Écritures
    return () => {
      elements.forEach((el, i) => {
        const y = positions[i] ?? '';
        el.dataset.parallaxY = y || '0';
        el.style.transform = y ? `translateY(${y}px)` : '';
      });
      heros.forEach((el) => {
        el.style.transform = hero;
      });
    };
  });
}
