// Hero « corde à linge » (essai) : chaque corde est une chaîne de points (intégration de Verlet,
// longueurs fixes, extrémités tenues aux bords) ; chaque pièce y pend comme un pendule.
// - Arrivée : les pièces sont accrochées une à une ; la corde plie sous leur poids.
// - Souris : passer sur une carte la pousse ; on l'attrape (la corde suit) et on la lâche.
// - Doigt : un tap pousse la carte ; glisser de côté l'attrape ; glisser vers le haut ou le bas
//   fait défiler la page.
// - Le scroll fait rebondir la corde.
// Les cartes restent dans l'ordre : le prénom reste lisible. La boucle s'arrête au repos.
// Avec prefers-reduced-motion : rien ne bouge (le CSS suffit).
import { mouvementReduit, surScroll } from './scroll-loop';

type Point = { x: number; y: number; px: number; py: number; fixe: boolean; poids: number };
type Corde = { points: Point[]; longueurs: number[]; traces: SVGPathElement[] };
type Piece = {
  el: HTMLElement;
  corde: Corde;
  /** Index du point de la corde où pince la pince à linge */
  i: number;
  l: number;
  /** Distance du pivot au centre de la pièce, et au bas de la pièce */
  L: number;
  h: number;
  theta: number;
  omega: number;
  /** Vitesse du pivot à l'image précédente (pour son accélération) */
  vx: number;
  vy: number;
  accrochee: boolean;
  repos: { x: number; y: number };
  vu: string;
};
type Prise = {
  piece: Piece;
  id: number;
  dx: number;
  dy: number;
  x0: number;
  y0: number;
  t: number;
};

const PAS = 1000 / 60; // pas fixe de la simulation
const N = 50; // segments par corde : un point tous les 2 % de largeur
const G_CORDE = 0.12;
const POIDS = 3; // poids d'une pièce accrochée, en multiples de la pesanteur d'un point
const AMORTI = 0.94; // la ficelle freine vite : pas de rebonds sans fin
const ITERATIONS = 80; // passes de contraintes, alternées dans les deux sens
const G_PENDULE = 0.9;
const AMORTI_PENDULE = 0.978;
const ANGLE_MAX = 0.75; // ~43° : la lettre reste lisible même en plein élan
const TIRAGE_MAX = 110; // px : distance maximale d'une pièce tirée à la main
const DECALAGE_PINCE = 8; // px : le pivot est 8 px sous le haut de la pince

const borne = (v: number, a: number) => Math.max(-a, Math.min(a, v));

const section = document.querySelector<HTMLElement>('[data-corde]');
const scene = section?.querySelector<HTMLElement>('[data-corde-scene]');
const plan = scene?.querySelector<HTMLElement>('[data-corde-plan]');

if (section && scene && plan && !mouvementReduit()) demarrer(section, scene, plan);

function demarrer(section: HTMLElement, scene: HTMLElement, plan: HTMLElement) {
  section.classList.add('est-pilotee');
  const elements = [...plan.querySelectorAll<HTMLElement>('[data-corde-piece]')];
  const svgs = [...plan.querySelectorAll<SVGSVGElement>('[data-corde-svg]')];
  let cordes: Corde[] = [];
  let pieces: Piece[] = [];
  let prise: Prise | undefined;
  let enCours = false;
  let precedent = 0;
  let reste = 0;
  let generation = 0;

  const construire = (avecArrivee: boolean) => {
    generation++;
    prise = undefined;
    const compacte = getComputedStyle(scene).getPropertyValue('--mobile').trim() === '1';
    const W = plan.clientWidth;
    const H = plan.clientHeight;
    const reglages = JSON.parse(
      (compacte ? plan.dataset.cordesCompacte : plan.dataset.cordesLarge) ?? '[]',
    ) as { y: number; creux: number }[];
    svgs.forEach((svg) => svg.setAttribute('viewBox', `0 0 ${W} ${H}`));

    // Cordes : même parabole que le tracé CSS, légèrement tendues
    cordes = reglages.map((c, k) => {
      const points: Point[] = [];
      for (let j = 0; j <= N; j++) {
        const t = j / N;
        const x = t * W;
        const y = ((c.y + c.creux * 4 * t * (1 - t)) / 100) * H;
        points.push({ x, y, px: x, py: y, fixe: j === 0 || j === N, poids: 0 });
      }
      const longueurs = points.slice(1).map((b, j) => {
        const a = points[j] ?? b;
        return Math.hypot(b.x - a.x, b.y - a.y) * 0.993;
      });
      const traces = svgs
        .map((svg) =>
          svg.querySelector<SVGPathElement>(
            `[data-corde-trace="${compacte ? 'compacte' : 'large'}-${k}"]`,
          ),
        )
        .filter((p): p is SVGPathElement => p !== null);
      return { points, longueurs, traces };
    });

    pieces = elements
      .filter((el) => el.offsetParent !== null)
      .flatMap((el) => {
        const [ci = 0, xp = 50] = ((compacte ? el.dataset.m : el.dataset.d) ?? '')
          .split(',')
          .map(Number);
        const corde = cordes[ci];
        const i = Math.max(1, Math.min(N - 1, Math.round((xp / 100) * N)));
        const p = corde?.points[i];
        if (!corde || !p) return [];
        return [
          {
            el,
            corde,
            i,
            l: el.offsetWidth,
            L: Math.max(40, el.offsetHeight * 0.55),
            h: el.offsetHeight - DECALAGE_PINCE,
            theta: 0,
            omega: 0,
            vx: 0,
            vy: 0,
            accrochee: false,
            repos: { x: p.x, y: p.y },
            vu: '',
          },
        ];
      });

    const gen = generation;
    pieces.forEach((piece, k) => {
      if (!avecArrivee) {
        piece.el.classList.add('est-accrochee');
        accrocher(piece, false);
        return;
      }
      // Accrochées une à une : la pièce tombe sur la corde, qui plie
      window.setTimeout(
        () => {
          if (gen !== generation) return;
          piece.el.style.setProperty('--penche', `${k % 2 ? -7 : 7}deg`);
          piece.el.classList.add('est-accrochee');
          window.setTimeout(() => gen === generation && accrocher(piece, true), 420);
        },
        250 + k * 230,
      );
    });
    dessiner();
    relancer();
  };

  // Le poids de la pièce se répartit sur trois points de la corde
  const accrocher = (piece: Piece, choc: boolean) => {
    const pts = piece.corde.points;
    [
      [-1, 0.25],
      [0, 0.5],
      [1, 0.25],
    ].forEach(([d = 0, part = 0]) => {
      const p = pts[piece.i + d];
      if (!p) return;
      p.poids += POIDS * part;
      if (choc) p.py -= 9 * part * 2;
    });
    piece.accrochee = true;
    if (choc) piece.omega = (piece.i % 2 ? -1 : 1) * 0.03;
    relancer();
  };

  const pas = () => {
    cordes.forEach((c) => {
      c.points.forEach((p) => {
        if (p.fixe) return;
        const vx = (p.x - p.px) * AMORTI;
        const vy = (p.y - p.py) * AMORTI;
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy + G_CORDE * (1 + p.poids);
      });
      // Une corde résiste à l'étirement, pas à la compression (elle peut se détendre)
      const n = c.points.length - 1;
      for (let k = 0; k < ITERATIONS; k++) {
        for (let m = 0; m < n; m++) {
          // Un passage de gauche à droite, le suivant de droite à gauche : la tension se
          // propage vite d'un bout à l'autre, la corde ne s'étire pas
          const j = k % 2 ? n - 1 - m : m;
          const a = c.points[j];
          const b = c.points[j + 1];
          const repos = c.longueurs[j];
          if (!a || !b || repos === undefined) continue;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 1e-6;
          if (d <= repos) continue;
          const ecart = (d - repos) / d;
          const wa = a.fixe ? 0 : b.fixe ? 1 : 0.5;
          const wb = b.fixe ? 0 : a.fixe ? 1 : 0.5;
          a.x += dx * ecart * wa;
          a.y += dy * ecart * wa;
          b.x -= dx * ecart * wb;
          b.y -= dy * ecart * wb;
        }
      }
      // Partie détendue : la ficelle retombe en courbe douce au lieu de faire des zigzags
      for (let j = 1; j < n; j++) {
        const a = c.points[j - 1];
        const p = c.points[j];
        const b = c.points[j + 1];
        const la = c.longueurs[j - 1];
        const lb = c.longueurs[j];
        if (!a || !p || !b || p.fixe || la === undefined || lb === undefined) continue;
        const detendue =
          Math.hypot(p.x - a.x, p.y - a.y) < la * 0.995 &&
          Math.hypot(b.x - p.x, b.y - p.y) < lb * 0.995;
        if (!detendue) continue;
        p.x += ((a.x + b.x) / 2 - p.x) * 0.5;
        p.y += ((a.y + b.y) / 2 - p.y) * 0.5 + 0.4;
      }
    });

    // Pendules : le pivot accélère, la pièce traîne derrière
    pieces.forEach((piece) => {
      const p = piece.corde.points[piece.i];
      if (!p) return;
      const vx = p.x - p.px;
      const vy = p.y - p.py;
      // Accélération du pivot, sans le bruit des contraintes de la corde
      const ax = Math.abs(vx - piece.vx) < 0.02 ? 0 : vx - piece.vx;
      const ay = Math.abs(vy - piece.vy) < 0.02 ? 0 : vy - piece.vy;
      piece.vx = vx;
      piece.vy = vy;
      if (!piece.accrochee) return;
      const alpha =
        -((G_PENDULE + ay) / piece.L) * Math.sin(piece.theta) -
        (ax / piece.L) * Math.cos(piece.theta);
      piece.omega = (piece.omega + alpha) * AMORTI_PENDULE;
      piece.theta = borne(piece.theta + piece.omega, ANGLE_MAX);
    });

    // Cartes voisines : elles se cognent au lieu de se traverser, et se passent leur élan
    cordes.forEach((c) => {
      const rang = pieces.filter((p) => p.corde === c && p.accrochee).sort((a, b) => a.i - b.i);
      for (let k = 0; k < rang.length - 1; k++) {
        const g = rang[k];
        const d = rang[k + 1];
        const pg = g?.corde.points[g.i];
        const pd = d?.corde.points[d.i];
        if (!g || !d || !pg || !pd) continue;
        // Coin bas droit de la carte de gauche, coin bas gauche de celle de droite
        const xg = pg.x + (g.l / 2) * Math.cos(g.theta) + g.h * Math.sin(g.theta);
        const xd = pd.x - (d.l / 2) * Math.cos(d.theta) + d.h * Math.sin(d.theta);
        const chevauche = xg - xd + 3;
        if (chevauche <= 0) continue;
        g.theta -= chevauche / (2 * g.h);
        d.theta += chevauche / (2 * d.h);
        const rapproche = g.omega - d.omega;
        if (rapproche > 0) {
          const moyenne = (g.omega + d.omega) / 2;
          g.omega = moyenne - 0.3 * (rapproche / 2);
          d.omega = moyenne + 0.3 * (rapproche / 2);
        }
      }
    });
  };

  const dessiner = () => {
    cordes.forEach((c) => {
      const d = c.points
        .map((p, j) => `${j ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join('');
      c.traces.forEach((t) => t.setAttribute('d', d));
    });
    pieces.forEach((piece) => {
      const p = piece.corde.points[piece.i];
      if (!p) return;
      // theta > 0 : la pièce part vers la droite, soit une rotation anti-horaire à l'écran
      const t = `translate(${(p.x - piece.l / 2).toFixed(1)}px, ${(p.y - DECALAGE_PINCE).toFixed(1)}px) rotate(${(-piece.theta).toFixed(4)}rad)`;
      if (t !== piece.vu) {
        piece.el.style.transform = t;
        piece.vu = t;
      }
    });
  };

  // Au repos quand tout est presque immobile pendant un tiers de seconde : on fige tout
  let calme = 0;
  const auRepos = () => {
    const immobile =
      !prise &&
      pieces.every((p) => p.accrochee && Math.abs(p.omega) < 0.0008) &&
      cordes.every((c) =>
        c.points.every((p) => Math.abs(p.x - p.px) < 0.05 && Math.abs(p.y - p.py) < 0.05),
      );
    calme = immobile ? calme + 1 : 0;
    if (calme < 20) return false;
    calme = 0;
    cordes.forEach((c) =>
      c.points.forEach((p) => {
        p.px = p.x;
        p.py = p.y;
      }),
    );
    pieces.forEach((p) => {
      p.omega = 0;
      p.vx = 0;
      p.vy = 0;
    });
    return true;
  };

  const boucle = (t: number) => {
    reste += Math.min(100, t - precedent);
    precedent = t;
    let n = 0;
    while (reste >= PAS && n < 4) {
      pas();
      reste -= PAS;
      n++;
    }
    if (n === 4) reste = 0;
    dessiner();
    if (auRepos()) {
      enCours = false;
      return;
    }
    requestAnimationFrame(boucle);
  };

  function relancer() {
    if (enCours) return;
    enCours = true;
    precedent = performance.now();
    reste = PAS;
    requestAnimationFrame(boucle);
  }

  const point = (e: PointerEvent) => {
    const s = plan.getBoundingClientRect();
    return { x: e.clientX - s.left, y: e.clientY - s.top };
  };
  const pieceDe = (el: HTMLElement) => pieces.find((p) => p.el === el && p.accrochee);

  const saisir = (piece: Piece, e: PointerEvent, x0: number, y0: number) => {
    const pivot = piece.corde.points[piece.i];
    if (!pivot) return;
    piece.el.setPointerCapture(e.pointerId);
    const q = point(e);
    pivot.fixe = true;
    prise = {
      piece,
      id: e.pointerId,
      dx: q.x - pivot.x,
      dy: q.y - pivot.y,
      x0,
      y0,
      t: performance.now(),
    };
    piece.el.classList.add('est-tenue');
    relancer();
  };

  const pousser = (piece: Piece, x: number, force: number) => {
    const pivot = piece.corde.points[piece.i];
    if (!pivot) return;
    piece.omega += (x < pivot.x ? 1 : -1) * force;
    relancer();
  };

  const lacher = () => {
    if (!prise) return;
    const pivot = prise.piece.corde.points[prise.piece.i];
    if (pivot) pivot.fixe = false;
    prise.piece.el.classList.remove('est-tenue');
    prise = undefined;
    relancer();
  };

  elements.forEach((el) => {
    let depart = { x: 0, y: 0, t: 0, id: -1 };

    el.addEventListener('pointerdown', (e) => {
      const piece = pieceDe(el);
      if (!piece || prise) return;
      const q = point(e);
      depart = { ...q, t: performance.now(), id: e.pointerId };
      section.classList.add('a-joue');
      if (e.pointerType === 'touch') return; // on attend de savoir si le doigt fait défiler
      e.preventDefault();
      saisir(piece, e, q.x, q.y);
    });

    el.addEventListener('pointermove', (e) => {
      const q = point(e);
      if (prise && prise.piece.el === el && prise.id === e.pointerId) {
        const pivot = prise.piece.corde.points[prise.piece.i];
        if (!pivot) return;
        const r = prise.piece.repos;
        let x = q.x - prise.dx;
        let y = q.y - prise.dy;
        const d = Math.hypot(x - r.x, y - r.y);
        if (d > TIRAGE_MAX) {
          x = r.x + ((x - r.x) / d) * TIRAGE_MAX;
          y = r.y + ((y - r.y) / d) * TIRAGE_MAX;
        }
        pivot.px = pivot.x;
        pivot.py = pivot.y;
        pivot.x = x;
        pivot.y = y;
        relancer();
        return;
      }
      const piece = pieceDe(el);
      if (!piece || prise) return;
      // Souris qui passe sur une carte sans l'attraper : elle la pousse
      if (e.pointerType === 'mouse' && e.buttons === 0) {
        piece.omega += borne(e.movementX * 0.0004, 0.01) * (100 / piece.L);
        section.classList.add('a-joue');
        relancer();
        return;
      }
      // Doigt : un glissement plutôt horizontal attrape la pièce (le vertical fait défiler)
      if (e.pointerType === 'touch' && depart.id === e.pointerId) {
        const dx = q.x - depart.x;
        const dy = q.y - depart.y;
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2)
          saisir(piece, e, depart.x, depart.y);
      }
    });

    const fin = (e: PointerEvent) => {
      const q = point(e);
      if (prise && prise.piece.el === el && prise.id === e.pointerId) {
        const clic =
          e.type === 'pointerup' &&
          performance.now() - prise.t < 300 &&
          Math.hypot(q.x - prise.x0, q.y - prise.y0) < 6;
        const piece = prise.piece;
        lacher();
        if (clic) pousser(piece, q.x, 0.04);
        return;
      }
      // Tap au doigt : la carte est poussée
      if (e.type !== 'pointerup' || e.pointerType !== 'touch' || depart.id !== e.pointerId) return;
      depart.id = -1;
      const piece = pieceDe(el);
      const tap =
        performance.now() - depart.t < 350 && Math.hypot(q.x - depart.x, q.y - depart.y) < 12;
      if (piece && tap) pousser(piece, q.x, 0.045);
    };
    el.addEventListener('pointerup', fin);
    el.addEventListener('pointercancel', fin);
    el.addEventListener('lostpointercapture', fin);
  });

  plan.addEventListener('dragstart', (e) => e.preventDefault());

  // Le scroll fait rebondir la corde : elle traîne derrière le mouvement de la page
  let scrollPrecedent = window.scrollY;
  surScroll(({ scrollY, vh }) => {
    const dy = scrollY - scrollPrecedent;
    scrollPrecedent = scrollY;
    const s = plan.getBoundingClientRect();
    if (!dy || s.bottom < 0 || s.top > vh) return;
    const v = borne(dy * 0.08, 4);
    cordes.forEach((c) =>
      c.points.forEach((p) => {
        if (!p.fixe) p.py -= v;
      }),
    );
    relancer();
    return undefined;
  });

  // Redimensionnement : tout est raccroché à sa place
  let taille = `${plan.clientWidth}x${plan.clientHeight}`;
  new ResizeObserver(() => {
    const nouvelle = `${plan.clientWidth}x${plan.clientHeight}`;
    if (nouvelle === taille) return;
    taille = nouvelle;
    construire(false);
  }).observe(plan);

  void document.fonts.ready.then(() => construire(true));
}
