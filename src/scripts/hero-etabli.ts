// Hero « établi vivant » (essai) : physique 2D vue de dessus (pas de gravité, frottement du papier
// sur le tapis), avec matter-js.
// - Chaque objet tombe sur le tapis (animation CSS), puis devient un corps physique.
// - Souris ou stylet : on attrape un objet et on le lance ; il glisse, tourne et cogne les autres.
// - Doigt : glisser vers le côté attrape et lance (glisser vers le haut ou le bas fait défiler la
//   page) ; un tap donne une pichenette.
// - Lisibilité : quelques secondes après le dernier geste, tout revient à sa place. Le post-it
//   « ranger le bureau » et l'étiquette « ↺ ranger le bureau » le font tout de suite.
// La boucle s'arrête dès que tout est immobile. Avec prefers-reduced-motion : rien ne bouge.
import Matter from 'matter-js';
import type { Body as Corps, Constraint as Contrainte } from 'matter-js';
import { borner, mouvementReduit } from './scroll-loop';

const { Engine, Bodies, Body, Composite, Constraint, Sleeping, Events } = Matter;

type Pose = { x: number; y: number; angle: number };
type Objet = { el: HTMLElement; corps: Corps; l: number; h: number; vu: string; repos: Pose };
type Prise = { objet: Objet; contrainte: Contrainte; id: number };

const PAS = 1000 / 60; // pas fixe de la simulation (même comportement à 60 et 120 Hz)
const VITESSE_MAX = 36;
const ROTATION_MAX = 0.3;
const RANGEMENT_AUTO = 6000; // ms après le dernier geste

// Matières : le papier glisse peu et ne rebondit presque pas ; les petits objets freinent vite
type Matiere = { densite: number; air: number; rebond: number };
const PETIT_OBJET: Matiere = { densite: 0.0015, air: 0.12, rebond: 0.2 };
const matieres: Record<string, Matiere | undefined> = {
  lettre: { densite: 0.002, air: 0.09, rebond: 0.15 },
  portrait: { densite: 0.003, air: 0.1, rebond: 0.1 },
  dymo: { densite: 0.002, air: 0.1, rebond: 0.2 },
};

const section = document.querySelector<HTMLElement>('[data-etabli]');
const scene = section?.querySelector<HTMLElement>('[data-etabli-scene]');
// Zone de jeu : repère de la physique (tout l'écran, ou au-dessus du texte en compact)
const plan = scene?.querySelector<HTMLElement>('[data-etabli-plan]');

if (section && scene && plan && !mouvementReduit()) void demarrer(section, scene, plan);

async function demarrer(section: HTMLElement, scene: HTMLElement, plan: HTMLElement) {
  // Les étiquettes se mesurent avec leur vraie police
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]);

  const moteur = Engine.create({ gravity: { x: 0, y: 0 }, enableSleeping: true });
  const elements = [...plan.querySelectorAll<HTMLElement>('[data-etabli-objet]')];
  const fixe = scene.querySelector<HTMLElement>('[data-etabli-fixe]');
  let objets: Objet[] = [];
  let prise: Prise | undefined;
  let enCours = false;
  let precedent = 0;
  let reste = 0;
  let premierPlan = 30;
  let reposAFixer = true;
  let minuterie = 0;
  let rangement = 0;
  let images = 0;

  // Pose au repos lue dans le CSS (en % de la zone de jeu), selon la disposition active
  const lirePose = (el: HTMLElement, W: number, H: number): Pose => {
    const s = getComputedStyle(el);
    const mobile = getComputedStyle(scene).getPropertyValue('--mobile').trim() === '1';
    const v = (nom: string) =>
      parseFloat(s.getPropertyValue(mobile ? `--${nom}m` : `--${nom}`)) || 0;
    return { x: (v('x') / 100) * W, y: (v('y') / 100) * H, angle: (v('r') * Math.PI) / 180 };
  };

  const dessiner = () => {
    objets.forEach((o) => {
      const { x, y } = o.corps.position;
      const t = `translate(${(x - o.l / 2).toFixed(1)}px, ${(y - o.h / 2).toFixed(1)}px) rotate(${o.corps.angle.toFixed(4)}rad)`;
      if (t !== o.vu) {
        o.el.style.transform = t;
        o.vu = t;
      }
    });
  };

  // Un objet a-t-il quitté sa place ?
  const derange = () =>
    objets.some((o) => {
      const ecart = Math.hypot(o.corps.position.x - o.repos.x, o.corps.position.y - o.repos.y);
      let tour = o.corps.angle - o.repos.angle;
      tour -= 2 * Math.PI * Math.round(tour / (2 * Math.PI));
      return ecart > 14 || Math.abs(tour) > 0.12;
    });

  const auRepos = () => {
    // Première immobilité après la chute : la pose réelle devient la pose de repos
    if (reposAFixer) {
      reposAFixer = false;
      objets.forEach((o) => (o.repos = { ...o.corps.position, angle: o.corps.angle }));
    }
    section.classList.toggle('est-derange', derange());
  };

  const boucle = (t: number) => {
    reste += Math.min(100, t - precedent);
    precedent = t;
    let n = 0;
    while (reste >= PAS && n < 4) {
      Engine.update(moteur, PAS);
      reste -= PAS;
      n++;
    }
    if (n === 4) reste = 0;
    dessiner();
    // « ↺ ranger » apparaît dès qu'un objet quitte sa place (vérifié toutes les 10 images)
    if (!reposAFixer && ++images % 10 === 0) section.classList.toggle('est-derange', derange());
    const immobile = !prise && objets.every((o) => o.corps.isSleeping || o.corps.isStatic);
    if (immobile) {
      enCours = false;
      if (objets.every((o) => !o.corps.isStatic)) auRepos();
      return;
    }
    requestAnimationFrame(boucle);
  };

  const relancer = () => {
    if (enCours) return;
    enCours = true;
    precedent = performance.now();
    reste = PAS;
    requestAnimationFrame(boucle);
  };

  // Vitesses bornées : un lancer trop fort traverserait les murs ou ferait toupie
  Events.on(moteur, 'afterUpdate', () => {
    objets.forEach(({ corps }) => {
      const v = Math.hypot(corps.velocity.x, corps.velocity.y);
      if (v > VITESSE_MAX) {
        Body.setVelocity(corps, {
          x: (corps.velocity.x / v) * VITESSE_MAX,
          y: (corps.velocity.y / v) * VITESSE_MAX,
        });
      }
      if (Math.abs(corps.angularVelocity) > ROTATION_MAX) {
        Body.setAngularVelocity(corps, Math.sign(corps.angularVelocity) * ROTATION_MAX);
      }
    });
  });

  const construire = (avecChute: boolean) => {
    Composite.clear(moteur.world, false);
    prise = undefined;
    reposAFixer = true;
    const W = plan.clientWidth;
    const H = plan.clientHeight;
    const s = plan.getBoundingClientRect();

    // Murs : bords de la zone de jeu ; en haut, sous l'en-tête quand il la recouvre (desktop)
    const barre = document.querySelector('header .bar')?.getBoundingClientRect();
    const haut =
      barre && barre.bottom > s.top && barre.top < s.top + 40 ? barre.bottom - s.top + 8 : 0;
    const e = 400;
    const murs = [
      Bodies.rectangle(W / 2, haut - e / 2, W + 2 * e, e, { isStatic: true }),
      Bodies.rectangle(W / 2, H + e / 2, W + 2 * e, e, { isStatic: true }),
      Bodies.rectangle(-e / 2, H / 2, e, H + 2 * e, { isStatic: true }),
      Bodies.rectangle(W + e / 2, H / 2, e, H + 2 * e, { isStatic: true }),
    ];
    // Le texte d'accueil est un obstacle : aucun objet ne vient le cacher
    if (fixe) {
      const f = fixe.getBoundingClientRect();
      const cx = f.left - s.left + f.width / 2;
      const cy = f.top - s.top + f.height / 2;
      murs.push(Bodies.rectangle(cx, cy, f.width + 20, f.height + 20, { isStatic: true }));
    }
    Composite.add(moteur.world, murs);

    objets = elements
      .filter((el) => el.offsetParent !== null)
      .map((el) => {
        const l = el.offsetWidth;
        const h = el.offsetHeight;
        const repos = lirePose(el, W, H);
        const m = matieres[el.dataset.matiere ?? ''] ?? PETIT_OBJET;
        const options = {
          angle: repos.angle,
          frictionAir: m.air,
          friction: 0.3,
          restitution: m.rebond,
          density: m.densite,
          chamfer: { radius: 4 },
        };
        const forme = el.dataset.forme;
        const corps =
          forme === 'cercle' || forme === 'feuille'
            ? Bodies.circle(
                repos.x,
                repos.y,
                Math.min(l, h) * (forme === 'feuille' ? 0.4 : 0.5),
                options,
              )
            : Bodies.rectangle(repos.x, repos.y, l, h, options);
        return { el, corps, l, h, vu: '', repos };
      });

    objets.forEach((o) => {
      o.el.style.zIndex = '';
      Composite.add(moteur.world, o.corps);
      if (!avecChute) return;
      // En l'air jusqu'à l'atterrissage : immobile et sans collision
      Body.setStatic(o.corps, true);
      o.corps.collisionFilter.mask = 0;
      const atterrir = () => {
        Body.setStatic(o.corps, false);
        o.corps.collisionFilter.mask = 0xffffffff;
        relancer();
      };
      // Animation de chute : attendue même si ce script arrive après son début (ou sa fin)
      const chute = o.el
        .querySelector('.corps')
        ?.getAnimations()
        .find((a) => a instanceof CSSAnimation && a.animationName === 'objet-tombe');
      if (chute && chute.playState !== 'finished') chute.finished.then(atterrir, atterrir);
      else atterrir();
    });
    dessiner();
    section.classList.remove('est-derange');
  };

  // Rangement : chaque objet revient à sa pose de repos, l'un après l'autre
  const ranger = () => {
    lacherPrise();
    window.clearTimeout(minuterie);
    const id = ++rangement;
    const debut = performance.now();
    const departs = objets.map((o) => ({ ...o.corps.position, angle: o.corps.angle }));
    objets.forEach((o) => Body.setStatic(o.corps, true));
    section.classList.remove('est-derange');
    const pas = (t: number) => {
      if (id !== rangement) return;
      const k = (t - debut) / 1000;
      objets.forEach((o, i) => {
        const d = departs[i];
        if (!d) return;
        const u = borner((k - i * 0.03) / 0.6);
        const e = 1 - Math.pow(1 - u, 3);
        let tour = o.repos.angle - d.angle;
        tour -= 2 * Math.PI * Math.round(tour / (2 * Math.PI));
        Body.setPosition(o.corps, {
          x: d.x + (o.repos.x - d.x) * e,
          y: d.y + (o.repos.y - d.y) * e,
        });
        Body.setAngle(o.corps, d.angle + tour * e);
      });
      dessiner();
      if (k < 0.6 + objets.length * 0.03) {
        requestAnimationFrame(pas);
        return;
      }
      objets.forEach((o) => {
        Body.setStatic(o.corps, false);
        o.corps.collisionFilter.mask = 0xffffffff;
        o.el.style.zIndex = '';
      });
      relancer();
    };
    requestAnimationFrame(pas);
  };

  // Après le dernier geste, l'établi se range tout seul (le prénom redevient lisible)
  const programmerRangement = () => {
    window.clearTimeout(minuterie);
    minuterie = window.setTimeout(() => {
      if (!prise && derange()) ranger();
    }, RANGEMENT_AUTO);
  };

  const point = (e: PointerEvent) => {
    const s = plan.getBoundingClientRect();
    return { x: e.clientX - s.left, y: e.clientY - s.top };
  };

  const saisir = (objet: Objet, e: PointerEvent) => {
    objet.el.setPointerCapture(e.pointerId);
    Sleeping.set(objet.corps, false);
    const p = point(e);
    const contrainte = Constraint.create({
      pointA: p,
      bodyB: objet.corps,
      pointB: { x: p.x - objet.corps.position.x, y: p.y - objet.corps.position.y },
      stiffness: 0.12,
      damping: 0.08,
      length: 0,
    });
    Composite.add(moteur.world, contrainte);
    prise = { objet, contrainte, id: e.pointerId };
    objet.el.classList.add('est-tenu');
    objet.el.style.zIndex = String(++premierPlan);
    window.clearTimeout(minuterie);
    relancer();
  };

  function lacherPrise() {
    if (!prise) return;
    Composite.remove(moteur.world, prise.contrainte);
    prise.objet.el.classList.remove('est-tenu');
    prise = undefined;
    programmerRangement();
    relancer();
  }

  const pichenette = (objet: Objet, p: { x: number; y: number }) => {
    const dx = objet.corps.position.x - p.x;
    const dy = objet.corps.position.y - p.y;
    const n = Math.hypot(dx, dy) || 1;
    Sleeping.set(objet.corps, false);
    Body.setVelocity(objet.corps, { x: (dx / n) * 18, y: (dy / n) * 18 });
    Body.setAngularVelocity(objet.corps, (Math.random() - 0.5) * 0.25);
    objet.el.style.zIndex = String(++premierPlan);
    programmerRangement();
    relancer();
  };

  const estPostIt = (el: HTMLElement) => el.classList.contains('objet--post-it');

  elements.forEach((el) => {
    let depart = { x: 0, y: 0, t: 0, id: -1 };
    const objetDe = () => objets.find((o) => o.el === el);

    el.addEventListener('pointerdown', (e) => {
      const objet = objetDe();
      if (!objet || objet.corps.isStatic || prise) return;
      depart = { ...point(e), t: performance.now(), id: e.pointerId };
      section.classList.add('a-joue');
      window.clearTimeout(minuterie);
      reposAFixer = false; // la pose de repos reste celle du CSS
      if (e.pointerType === 'touch') return; // on attend de savoir si le doigt fait défiler
      e.preventDefault();
      saisir(objet, e);
    });

    el.addEventListener('pointermove', (e) => {
      if (prise && prise.objet.el === el && prise.id === e.pointerId) {
        const p = point(e);
        prise.contrainte.pointA = {
          x: Math.min(plan.clientWidth, Math.max(0, p.x)),
          y: Math.min(plan.clientHeight, Math.max(0, p.y)),
        };
        return;
      }
      // Doigt : un glissement plutôt horizontal attrape l'objet (le vertical fait défiler)
      if (e.pointerType !== 'touch' || prise || depart.id !== e.pointerId) return;
      const p = point(e);
      const dx = p.x - depart.x;
      const dy = p.y - depart.y;
      const objet = objetDe();
      if (objet && !objet.corps.isStatic && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        saisir(objet, e);
      }
    });

    const fin = (e: PointerEvent) => {
      if (prise && prise.objet.el === el && prise.id === e.pointerId) {
        const p = point(e);
        const clic =
          e.type === 'pointerup' &&
          performance.now() - depart.t < 300 &&
          Math.hypot(p.x - depart.x, p.y - depart.y) < 6;
        lacherPrise();
        if (clic && estPostIt(el)) ranger();
        return;
      }
      // Tap au doigt : pichenette (ou rangement sur le post-it)
      if (e.type !== 'pointerup' || e.pointerType !== 'touch' || depart.id !== e.pointerId) return;
      depart.id = -1;
      const objet = objetDe();
      const p = point(e);
      const tap =
        performance.now() - depart.t < 350 && Math.hypot(p.x - depart.x, p.y - depart.y) < 12;
      if (!objet || objet.corps.isStatic || !tap) return;
      if (estPostIt(el)) ranger();
      else pichenette(objet, p);
    };
    el.addEventListener('pointerup', fin);
    el.addEventListener('pointercancel', fin);
    el.addEventListener('lostpointercapture', fin);
  });

  // Pas de glisser-déposer natif des images (il volerait le geste)
  scene.addEventListener('dragstart', (e) => e.preventDefault());
  scene.querySelector('[data-etabli-ranger]')?.addEventListener('click', ranger);

  // Redimensionnement : on repose tout à sa place
  let taille = `${plan.clientWidth}x${plan.clientHeight}`;
  new ResizeObserver(() => {
    const nouvelle = `${plan.clientWidth}x${plan.clientHeight}`;
    if (nouvelle === taille) return;
    taille = nouvelle;
    rangement++;
    window.clearTimeout(minuterie);
    construire(false);
    relancer();
  }).observe(plan);

  construire(true);
  section.classList.add('est-actif');
}
