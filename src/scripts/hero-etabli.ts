// Hero « établi vivant » (essai) : physique 2D vue de dessus (pas de gravité, frottement du papier
// sur le tapis), avec matter-js chargé à la demande.
// - Chaque objet tombe sur le tapis (animation CSS), puis devient un corps physique.
// - Souris ou stylet : on attrape un objet et on le lance ; il glisse, tourne et cogne les autres.
// - Doigt : une pichenette (le scroll de la page reste libre).
// - Le scroll secoue un peu l'établi : les objets « traînent » derrière le mouvement.
// - Un clic sur le post-it « ranger le bureau » ramène tout à sa place.
// La boucle s'arrête dès que tout est immobile. Avec prefers-reduced-motion : rien ne bouge.
import type { Body as Corps, Constraint as Contrainte } from 'matter-js';
import { borner, mouvementReduit, surScroll } from './scroll-loop';

type Pose = { x: number; y: number; angle: number };
type Objet = { el: HTMLElement; corps: Corps; l: number; h: number; vu: string; repos: Pose };

const VITESSE_MAX = 40;

const section = document.querySelector<HTMLElement>('[data-etabli]');
const scene = section?.querySelector<HTMLElement>('[data-etabli-scene]');

if (section && scene && !mouvementReduit()) void demarrer(section, scene);

async function demarrer(section: HTMLElement, scene: HTMLElement) {
  const { default: Matter } = await import('matter-js');
  const { Engine, Bodies, Body, Composite, Constraint, Sleeping, Events } = Matter;

  const moteur = Engine.create({ gravity: { x: 0, y: 0 }, enableSleeping: true });
  const elements = [...scene.querySelectorAll<HTMLElement>('[data-etabli-objet]')];
  const fixe = scene.querySelector<HTMLElement>('[data-etabli-fixe]');
  let objets: Objet[] = [];
  let murs: Corps[] = [];
  let enCours = false;
  let precedent = 0;
  let premierPlan = 30;

  // Pose au repos lue dans le CSS (en % de la scène), selon la mise en page active
  const lirePose = (el: HTMLElement, W: number, H: number) => {
    const s = getComputedStyle(el);
    const mobile = W < 760;
    const v = (nom: string) =>
      parseFloat(s.getPropertyValue(mobile ? `--${nom}m` : `--${nom}`)) || 0;
    return { x: (v('x') / 100) * W, y: (v('y') / 100) * H, angle: (v('r') * Math.PI) / 180 };
  };

  const construire = (avecChute: boolean) => {
    Composite.clear(moteur.world, false);
    const W = scene.clientWidth;
    const H = scene.clientHeight;
    const s = scene.getBoundingClientRect();

    // Murs : bords de la scène ; en haut, sous l'en-tête quand il la recouvre (desktop)
    const barre = document.querySelector('header .bar')?.getBoundingClientRect();
    const haut =
      barre && barre.bottom > s.top && barre.top < s.top + 40 ? barre.bottom - s.top + 8 : 0;
    const e = 400;
    murs = [
      Bodies.rectangle(W / 2, haut - e / 2, W + 2 * e, e, { isStatic: true }),
      Bodies.rectangle(W / 2, H + e / 2, W + 2 * e, e, { isStatic: true }),
      Bodies.rectangle(-e / 2, H / 2, e, H + 2 * e, { isStatic: true }),
      Bodies.rectangle(W + e / 2, H / 2, e, H + 2 * e, { isStatic: true }),
    ];
    if (fixe) {
      const f = fixe.getBoundingClientRect();
      murs.push(
        Bodies.rectangle(
          f.left - s.left + f.width / 2,
          f.top - s.top + f.height / 2,
          f.width + 16,
          f.height + 16,
          {
            isStatic: true,
          },
        ),
      );
    }
    Composite.add(moteur.world, murs);

    objets = elements
      .filter((el) => el.offsetParent !== null)
      .map((el) => {
        const l = el.offsetWidth;
        const h = el.offsetHeight;
        const { x, y, angle } = lirePose(el, W, H);
        const options = {
          angle,
          frictionAir: 0.075,
          friction: 0.25,
          restitution: 0.3,
          density: 0.0015,
          chamfer: { radius: 4 },
        };
        const corps =
          el.dataset.forme === 'cercle'
            ? Bodies.circle(x, y, Math.min(l, h) / 2, options)
            : Bodies.rectangle(x, y, l, h, options);
        return { el, corps, l, h, vu: '', repos: { x, y, angle } };
      });

    objets.forEach((o) => {
      Composite.add(moteur.world, o.corps);
      if (!avecChute) return;
      // En l'air jusqu'à l'atterrissage : immobile et sans collision
      Body.setStatic(o.corps, true);
      o.corps.collisionFilter.mask = 0;
      const atterrir = () => {
        Body.setStatic(o.corps, false);
        o.corps.collisionFilter.mask = 0xffffffff;
        Body.setVelocity(o.corps, {
          x: (Math.random() - 0.5) * 1.5,
          y: (Math.random() - 0.5) * 1.5,
        });
        Body.setAngularVelocity(o.corps, (Math.random() - 0.5) * 0.02);
        relancer();
      };
      const corpsEl = o.el.querySelector('.corps');
      if (corpsEl && getComputedStyle(corpsEl).animationName !== 'none') {
        // animationend remonte aussi des descendants : on attend celle de la chute
        const fin = (e: Event) => {
          if (e.target !== corpsEl) return;
          corpsEl.removeEventListener('animationend', fin);
          atterrir();
        };
        corpsEl.addEventListener('animationend', fin);
      } else atterrir();
    });
    dessiner();
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

  // Vitesse bornée : un lancer trop fort traverserait les murs
  Events.on(moteur, 'afterUpdate', () => {
    objets.forEach(({ corps }) => {
      const v = Math.hypot(corps.velocity.x, corps.velocity.y);
      if (v > VITESSE_MAX)
        Body.setVelocity(corps, {
          x: (corps.velocity.x / v) * VITESSE_MAX,
          y: (corps.velocity.y / v) * VITESSE_MAX,
        });
    });
  });

  let prise: { objet: Objet; contrainte: Contrainte; id: number } | undefined;

  const boucle = (t: number) => {
    Engine.update(moteur, Math.min(32, Math.max(8, t - precedent || 16.7)));
    precedent = t;
    dessiner();
    const immobile = !prise && objets.every((o) => o.corps.isSleeping || o.corps.isStatic);
    if (immobile) {
      enCours = false;
      return;
    }
    requestAnimationFrame(boucle);
  };

  const relancer = () => {
    if (enCours) return;
    enCours = true;
    precedent = performance.now();
    requestAnimationFrame(boucle);
  };

  const point = (e: PointerEvent) => {
    const s = scene.getBoundingClientRect();
    return { x: e.clientX - s.left, y: e.clientY - s.top };
  };

  // Rangement : chaque objet revient à sa pose de repos, l'un après l'autre
  let rangement = 0;
  const ranger = () => {
    const id = ++rangement;
    const debut = performance.now();
    const departs = objets.map((o) => ({ ...o.corps.position, angle: o.corps.angle }));
    objets.forEach((o) => Body.setStatic(o.corps, true));
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
        o.el.style.zIndex = '';
      });
      relancer();
    };
    requestAnimationFrame(pas);
  };
  const estPostIt = (el: HTMLElement) => el.classList.contains('objet--post-it');
  scene.querySelector('[data-etabli-ranger]')?.addEventListener('click', ranger);

  // Attraper et lancer (souris, stylet) ; pichenette (doigt)
  objets = [];
  elements.forEach((el) => {
    let depart = { x: 0, y: 0, t: 0 };
    el.addEventListener('pointerdown', (e) => {
      const objet = objets.find((o) => o.el === el);
      if (!objet || objet.corps.isStatic) return;
      depart = { ...point(e), t: performance.now() };
      section.classList.add('a-joue');
      if (e.pointerType === 'touch') return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
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
      el.classList.add('est-tenu');
      el.style.zIndex = String(++premierPlan);
      relancer();
    });

    el.addEventListener('pointermove', (e) => {
      if (!prise || prise.objet.el !== el || prise.id !== e.pointerId) return;
      const p = point(e);
      prise.contrainte.pointA = {
        x: Math.min(scene.clientWidth, Math.max(0, p.x)),
        y: Math.min(scene.clientHeight, Math.max(0, p.y)),
      };
    });

    const lacher = (e: PointerEvent) => {
      const objet = objets.find((o) => o.el === el);
      if (e.pointerType === 'touch' && objet && !objet.corps.isStatic) {
        // Pichenette : un tap bref et presque immobile pousse l'objet loin du doigt
        const p = point(e);
        if (performance.now() - depart.t < 350 && Math.hypot(p.x - depart.x, p.y - depart.y) < 12) {
          if (estPostIt(el)) {
            ranger();
            return;
          }
          const dx = objet.corps.position.x - p.x;
          const dy = objet.corps.position.y - p.y;
          const n = Math.hypot(dx, dy) || 1;
          Sleeping.set(objet.corps, false);
          Body.setVelocity(objet.corps, { x: (dx / n) * 20, y: (dy / n) * 20 });
          Body.setAngularVelocity(objet.corps, (Math.random() - 0.5) * 0.3);
          el.style.zIndex = String(++premierPlan);
          relancer();
        }
        return;
      }
      if (!prise || prise.objet.el !== el) return;
      Composite.remove(moteur.world, prise.contrainte);
      prise = undefined;
      el.classList.remove('est-tenu');
      const p = point(e);
      const clic =
        performance.now() - depart.t < 300 && Math.hypot(p.x - depart.x, p.y - depart.y) < 6;
      if (clic && estPostIt(el)) ranger();
      else relancer();
    };
    el.addEventListener('pointerup', lacher);
    el.addEventListener('pointercancel', lacher);
  });

  // Le scroll secoue l'établi : les objets traînent derrière le mouvement de la page
  let scrollPrecedent = window.scrollY;
  surScroll(({ scrollY, vh }) => {
    const dy = scrollY - scrollPrecedent;
    scrollPrecedent = scrollY;
    const s = scene.getBoundingClientRect();
    if (!dy || s.bottom < 0 || s.top > vh) return;
    const secousse = Math.max(-5, Math.min(5, dy * 0.06));
    objets.forEach(({ corps }) => {
      if (corps.isStatic) return;
      Sleeping.set(corps, false);
      Body.setVelocity(corps, { x: corps.velocity.x, y: corps.velocity.y + secousse });
    });
    relancer();
    return undefined;
  });

  // Redimensionnement : on repose tout à sa place
  let taille = `${scene.clientWidth}x${scene.clientHeight}`;
  new ResizeObserver(() => {
    const nouvelle = `${scene.clientWidth}x${scene.clientHeight}`;
    if (nouvelle === taille) return;
    taille = nouvelle;
    prise = undefined;
    construire(false);
    relancer();
  }).observe(scene);

  construire(true);
}
