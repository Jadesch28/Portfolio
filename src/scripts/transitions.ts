// Accueil → page projet : au clic sur une carte, on nomme les éléments qui doivent sortir
// (carnet, texte et scotch de la carte cliquée), juste avant la capture de la transition.
// Les noms eux-mêmes sont dans styles/transitions.css.

const racine = document.documentElement;

const nettoyer = () => {
  racine.classList.remove('vers-projet');
  document
    .querySelectorAll('.card.is-leaving')
    .forEach((carte) => carte.classList.remove('is-leaving'));
};

document.querySelectorAll<HTMLElement>('.card[data-projet]').forEach((carte) => {
  carte.querySelectorAll<HTMLAnchorElement>('a[href^="/projets/"]').forEach((lien) => {
    lien.addEventListener('click', (event) => {
      // Ouverture dans un nouvel onglet : pas de transition dans cette page.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      nettoyer();
      racine.classList.add('vers-projet');
      carte.classList.add('is-leaving');
    });
  });
});

// Page restaurée par le bouton « retour » (cache du navigateur) : on repart propre.
window.addEventListener('pageshow', nettoyer);
