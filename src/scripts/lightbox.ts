// Visionneuse : un clic sur une image [data-zoom] l'affiche en grand dans le <dialog>, qui gère déjà
// le focus et la touche Échap. Flèches (ou glisser au doigt) : image voisine. Clic à côté : fermeture.
const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox]');
const image = dialog?.querySelector<HTMLImageElement>('[data-lightbox-image]');
const liens = [...document.querySelectorAll<HTMLAnchorElement>('[data-zoom]')];

if (dialog && image && liens.length > 0) {
  let courant = 0;
  let departX: number | undefined;

  const afficher = (i: number) => {
    courant = (i + liens.length) % liens.length;
    const lien = liens[courant];
    if (!lien) return;
    image.src = lien.href;
    image.alt = lien.dataset.alt ?? '';
    if (lien.dataset.fond) dialog.dataset.fond = lien.dataset.fond;
    else delete dialog.dataset.fond;
  };

  dialog.toggleAttribute('data-seule', liens.length === 1);

  liens.forEach((lien, i) => {
    lien.addEventListener('click', (e) => {
      // Ctrl/Cmd + clic : ouverture normale dans un nouvel onglet
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      afficher(i);
      dialog.showModal();
    });
  });

  dialog.querySelector('[data-precedente]')?.addEventListener('click', () => afficher(courant - 1));
  dialog.querySelector('[data-suivante]')?.addEventListener('click', () => afficher(courant + 1));
  dialog.querySelector('[data-fermer]')?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') afficher(courant - 1);
    if (e.key === 'ArrowRight') afficher(courant + 1);
  });

  dialog.addEventListener('touchstart', (e) => {
    departX = e.touches[0]?.clientX;
  });
  dialog.addEventListener('touchend', (e) => {
    const finX = e.changedTouches[0]?.clientX;
    if (departX === undefined || finX === undefined) return;
    const ecart = finX - departX;
    if (Math.abs(ecart) > 50) afficher(courant + (ecart < 0 ? 1 : -1));
    departX = undefined;
  });

  // Plus rien à afficher une fois fermé
  dialog.addEventListener('close', () => image.removeAttribute('src'));
}
