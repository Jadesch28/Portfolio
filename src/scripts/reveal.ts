// Apparitions au scroll : chaque [data-reveal] reçoit .is-in une seule fois, dès que 15 % est visible.
// Les classes rv1–rv4 de ses enfants jouent alors leur animation (styles/animations.css).

const blocs = document.querySelectorAll<HTMLElement>('[data-reveal]');

if ('IntersectionObserver' in window) {
  const observateur = new IntersectionObserver(
    (entrees) => {
      entrees.forEach((entree) => {
        if (!entree.isIntersecting) return;
        entree.target.classList.add('is-in');
        observateur.unobserve(entree.target);
      });
    },
    { threshold: 0.15 },
  );
  blocs.forEach((bloc) => observateur.observe(bloc));
} else {
  blocs.forEach((bloc) => bloc.classList.add('is-in'));
}
