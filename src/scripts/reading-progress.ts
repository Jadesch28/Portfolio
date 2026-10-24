// Barre de lecture de la page projet : remplissage = progression du scroll dans la page.
import { borner, surScroll } from './scroll-loop';

const barre = document.querySelector<HTMLElement>('[data-reading-progress]');

if (barre) {
  surScroll(({ scrollY, vh }) => {
    const total = document.documentElement.scrollHeight - vh;
    const progression = total > 0 ? borner(scrollY / total).toFixed(4) : '0';
    return () => barre.style.setProperty('--progress', progression);
  });
}
