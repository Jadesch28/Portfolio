// Vidéos de projet : lues seulement quand elles sont visibles, avec un bouton pause/lecture
// (contenu en mouvement de plus de 5 s : il doit pouvoir être arrêté).
// Avec prefers-reduced-motion, rien ne démarre tout seul : l'image d'attente reste affichée.
// Les vidéos démarrent muettes (lecture automatique) ; le bouton son, s'il existe, l'active.

const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll<HTMLElement>('[data-video]').forEach((cadre) => {
  const video = cadre.querySelector('video');
  const bouton = cadre.querySelector<HTMLButtonElement>('[data-video-toggle]');
  const son = cadre.querySelector<HTMLButtonElement>('[data-video-son]');
  if (!video || !bouton) return;

  // Choix de la personne : une pause manuelle n'est pas relancée par le scroll.
  let enPause = reduit;
  let visible = false;

  const majBouton = () => {
    const lecture = !video.paused;
    bouton.textContent = (lecture ? bouton.dataset.pause : bouton.dataset.lecture) ?? '';
  };

  const majSon = () => {
    if (son) son.textContent = (video.muted ? son.dataset.activer : son.dataset.couper) ?? '';
  };

  const synchroniser = () => {
    if (visible && !enPause) {
      video.play().catch(() => {
        // Lecture avec le son refusée par le navigateur : on réessaie en muet.
        if (!video.muted) {
          video.muted = true;
          synchroniser();
        }
        // Sinon, lecture refusée : on reste sur l'image d'attente.
      });
    } else {
      video.pause();
    }
  };

  video.addEventListener('play', majBouton);
  video.addEventListener('pause', majBouton);
  video.addEventListener('volumechange', majSon);

  bouton.addEventListener('click', () => {
    enPause = !video.paused;
    if (!enPause) visible = true;
    synchroniser();
  });

  // Activer le son relance aussi la lecture si la vidéo était en pause.
  son?.addEventListener('click', () => {
    video.muted = !video.muted;
    if (video.muted) return;
    enPause = false;
    visible = true;
    synchroniser();
  });

  new IntersectionObserver(
    ([entree]) => {
      visible = entree?.isIntersecting ?? false;
      synchroniser();
    },
    { threshold: 0.25 },
  ).observe(video);

  majBouton();
  majSon();
});
