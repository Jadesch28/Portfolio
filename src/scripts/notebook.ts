// Carnet sommaire : suit la lecture des cartes projet.
// Projet actif = la dernière carte dont le haut passe au-dessus de 55 % de l'écran
// (et dont le bas est encore sous 20 %). Le cercle au crayon se dessine autour de lui.
import { surScroll } from './scroll-loop';

const carnet = document.querySelector<HTMLElement>('[data-notebook]');
const cartes = [...document.querySelectorAll<HTMLElement>('article[data-projet]')];

if (carnet && cartes.length > 0) {
  const liens = [...carnet.querySelectorAll<HTMLElement>('[data-toc]')];
  const numero = carnet.querySelector<HTMLElement>('[data-toc-num]');
  const courant = carnet.querySelector<HTMLElement>('[data-toc-courant]');
  let actif: string | undefined;

  const activer = (id: string) => {
    if (id === actif) return;
    actif = id;
    liens.forEach((lien) => {
      const oui = lien.dataset.toc === id;
      lien.classList.toggle('is-active', oui);
      if (oui) lien.setAttribute('aria-current', 'true');
      else lien.removeAttribute('aria-current');
    });
    const lien = liens.find((l) => l.dataset.toc === id);
    if (numero && lien?.dataset.tocNumero) numero.textContent = lien.dataset.tocNumero;
    if (courant && lien?.dataset.tocLibelle) courant.textContent = lien.dataset.tocLibelle;
  };

  surScroll(({ vh }) => {
    let candidat: string | undefined;
    cartes.forEach((carte) => {
      const r = carte.getBoundingClientRect();
      if (r.top < vh * 0.55 && r.bottom > vh * 0.2) candidat = carte.dataset.projet;
    });
    if (candidat && candidat !== actif) {
      const id = candidat;
      return () => activer(id);
    }
  });
}
