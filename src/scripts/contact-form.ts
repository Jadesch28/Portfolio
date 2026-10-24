// Formulaire de contact : validation, envoi en POST (Formspree…), tampon « ENVOYÉ ».
// Sans JavaScript, le formulaire s'envoie normalement vers son `action`.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Champ = HTMLInputElement | HTMLTextAreaElement;

document.querySelectorAll<HTMLElement>('[data-contact-form]').forEach((carnet) => {
  const form = carnet.querySelector('form');
  const envoye = carnet.querySelector<HTMLElement>('.envoye');
  const echec = carnet.querySelector<HTMLElement>('.echec');
  const bouton = carnet.querySelector<HTMLButtonElement>('[data-envoyer]');
  const autre = carnet.querySelector<HTMLButtonElement>('[data-autre-message]');
  if (!form || !envoye || !echec || !bouton) return;

  const libelleBouton = bouton.innerHTML;
  const champ = (nom: string) => form.elements.namedItem(nom) as Champ | null;
  const regles: Array<[string, (valeur: string) => boolean]> = [
    ['prenom', (v) => v.length > 0],
    ['email', (v) => EMAIL.test(v)],
    ['message', (v) => v.length > 0],
  ];
  let tente = false;

  // Affiche ou retire l'erreur d'un champ ; renvoie true s'il est valide.
  const verifier = (nom: string, test: (valeur: string) => boolean) => {
    const el = champ(nom);
    if (!el) return true;
    const valide = test(el.value.trim());
    const erreur = document.getElementById(`${el.id}-erreur`);
    el.classList.toggle('err', !valide);
    if (valide) {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    } else {
      el.setAttribute('aria-invalid', 'true');
      if (erreur) el.setAttribute('aria-describedby', erreur.id);
    }
    if (erreur) erreur.hidden = valide;
    return valide;
  };

  // Après une première tentative, les erreurs se corrigent au fil de la saisie.
  regles.forEach(([nom, test]) => {
    champ(nom)?.addEventListener('input', () => {
      if (tente) verifier(nom, test);
    });
  });

  // Pendant l'envoi : bouton désactivé, libellé « Envoi… ».
  const occupe = (oui: boolean) => {
    bouton.disabled = oui;
    if (oui) bouton.textContent = bouton.dataset.envoi ?? '';
    else bouton.innerHTML = libelleBouton;
  };

  const afficherEnvoye = () => {
    form.hidden = true;
    envoye.hidden = false;
    envoye.focus();
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    tente = true;
    echec.hidden = true;

    const [premierInvalide] = regles.filter(([nom, test]) => !verifier(nom, test));
    if (premierInvalide) {
      champ(premierInvalide[0])?.focus();
      return;
    }

    // Pot de miel rempli : un robot. On fait comme si tout allait bien, sans rien envoyer.
    if (champ('_gotcha')?.value) {
      afficherEnvoye();
      return;
    }

    occupe(true);
    try {
      const reponse = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!reponse.ok) throw new Error(String(reponse.status));
      form.reset();
      tente = false;
      afficherEnvoye();
    } catch {
      echec.hidden = false;
    } finally {
      occupe(false);
    }
    // Le bouton désactivé a perdu le focus pendant l'envoi : on le lui rend en cas d'échec.
    if (!echec.hidden) bouton.focus();
  });

  autre?.addEventListener('click', () => {
    envoye.hidden = true;
    form.hidden = false;
    champ('prenom')?.focus();
  });
});
