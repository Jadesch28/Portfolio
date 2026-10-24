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

    elements.forEach((el) => {
      if (!actif) {
        el.style.transform = '';
        return;
      }
      const r = el.getBoundingClientRect();
      // On mesure sans la translation déjà appliquée.
      const decalage = Number(el.dataset.parallaxY ?? 0);
      const centre = r.top - decalage + r.height / 2;
      const q = borner((centre - vh / 2) / vh, -1, 1);
      const y = q * Number(el.dataset.parallax);
      el.dataset.parallaxY = y.toFixed(1);
      el.style.transform = `translateY(${y.toFixed(1)}px)`;
    });

    heros.forEach((el) => {
      el.style.transform = actif ? `translateY(${Math.min(120, scrollY * 0.18).toFixed(1)}px)` : '';
    });
  });
}
