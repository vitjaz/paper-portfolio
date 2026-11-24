/**
 * Paper pieces: the kit every district is built from.
 *
 * Everything here is a cut card, a slotted cross, a folded volume or a printed plate.
 * Repeated props are built once as a template and cloned (clone shares print materials,
 * so the world's 150+ cards cost a few dozen prints).
 */
import * as THREE from 'three';
import * as P2 from '../papercraft/lib/paperkit-2d.js';
import * as PK3 from '../papercraft/lib/paperkit-3d.js';
const { makeCard, crossCard, fanCard, boxFold, prismFold, paperMaterial } = PK3 as any;
const printCard = (P2 as any).printCard as any;
import { C } from './palette';
import { signPaint, plaquePaint, text, kicker, plate, windows, screen, aiMark } from './print';

export interface PickRoot { id: string; obj: THREE.Object3D; lift: number; baseY: number; hover: number; kickAt: number }

export class WorldKit {
  paper: any;
  scene: THREE.Scene;
  roots: PickRoot[] = [];
  pickables: THREE.Mesh[] = [];
  steps: { fn: (t: number, dt: number) => void; ambient: boolean }[] = [];
  signs: Record<string, THREE.Object3D> = {};

  constructor(scene: THREE.Scene, paper: any) {
    this.scene = scene;
    this.paper = paper;
  }

  card(z = 0, px = 46, extra: any = {}) {
    return {
      paper: this.paper,
      pxPerUnit: px,
      thickness: 0.09,
      edgeWidth: 0.055,
      contact: { amount: 0.12, height: 0.42 },
      seed: 3,
      glowColor: '#cdeeff',
      glow: 1.25,
      ...extra,
    };
  }

  kraft(color: string = C.kraft): THREE.Material {
    return paperMaterial({ color, map: this.paper.map, normalMap: this.paper.normalMap, normalScale: 0.55 });
  }

  add<T extends THREE.Object3D>(obj: T, parent?: THREE.Object3D): T {
    (parent || this.scene).add(obj);
    return obj;
  }

  /** Mark a root as belonging to a hotspot: its meshes become pickable and it lifts on hover. */
  hotspot(id: string, obj: THREE.Object3D, { lift = 0.16, pick = true, baseY = null } = {}) {
    if (pick) {
      obj.traverse((o: any) => {
        if (o.isMesh) { o.userData.hotspot = id; this.pickables.push(o); }
      });
    }
    this.roots.push({ id, obj, lift, baseY: baseY ?? obj.position.y, hover: 0, kickAt: -10 });
    return obj;
  }

  onStep(fn: (t: number, dt: number) => void, opts: { ambient?: boolean } = {}) { this.steps.push({ fn, ambient: opts.ambient !== false }); return fn; }
}

/* ------------------------------------------------------------------ outlines */

export function rectPts(w: number, h: number): [number, number][] {
  return [[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]];
}

export function roundRect(w: number, h: number, r = 0.2): [number, number][] {
  const out: [number, number][] = [];
  const corner = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= 8; i++) { const a = a0 + (Math.PI / 2) * (i / 8); out.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
  };
  corner(w / 2 - r, r, -Math.PI / 2);
  corner(w / 2 - r, h - r, 0);
  corner(-w / 2 + r, h - r, Math.PI / 2);
  corner(-w / 2 + r, r, Math.PI);
  return out;
}

export function crossRect(w: number, h: number): [number, number][] {
  return [[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]];
}

/* ------------------------------------------------------------------ signed plates */

export interface SignOpts {
  id: string; x: number; z: number; title: string; sub?: string; kicker?: string;
  accent?: string; w?: number; h?: number; postH?: number; yaw?: number; scale?: number;
}

/**
 * A standing paper tag on a kraft post: two card layers (kraft back, printed face) leaning
 * back toward the viewer. It is the world's main affordance — big enough for a thumb.
 */
export function makeSign(kit: WorldKit, o: SignOpts): THREE.Group {
  const w = (o.w ?? 6.6) * (o.scale ?? 1), h = (o.h ?? 3.9) * (o.scale ?? 1);
  const postH = (o.postH ?? 3.0) * (o.scale ?? 1);
  const g = new THREE.Group();
  g.position.set(o.x, 0, o.z);
  g.rotation.y = o.yaw ?? 0;

  const post = crossCard(crossRect(0.5 * (o.scale ?? 1), postH + 0.4), {
    ...kit.card(o.z, 34),
    thickness: 0.07,
    seed: 21,
    paint: (P: any) => { P.fill(C.kraft); P.innerShade('#5a3a20', { alpha: 0.3, blurPx: 8 }); P.marks('panel', { color: 'rgba(120,84,48,0.35)', size: 0.18, density: 0.6 }); },
    back: 'kraft',
  });
  post.position.y = 0;
  g.add(post);
  kit.hotspot(o.id, post, { lift: 0 });

  const plateG = new THREE.Group();
  plateG.position.y = postH + 0.25;
  plateG.rotation.x = 0.1;

  // the kraft card behind, a hair larger: the tag's second layer
  const back = makeCard(roundRect(w + 0.28, h + 0.2, 0.26), {
    ...kit.card(o.z, 38),
    seed: 31,
    paint: (P: any) => { P.fill(C.kraftDeep); P.innerShade('#4a2f18', { alpha: 0.35, blurPx: 10 }); },
    back: 'kraft',
    folds: [],
  });
  back.position.set(0.02, -0.06, -0.16);
  back.rotation.z = -0.012;
  plateG.add(back);

  const face = makeCard(roundRect(w, h, 0.22), {
    ...kit.card(o.z, 72),
    seed: 37,
    thickness: 0.1,
    edgeWidth: 0.07,
    paint: signPaint({ title: o.title, sub: o.sub, kicker: o.kicker, accent: o.accent }),
    back: 'kraft',
    folds: [],
  });
  plateG.add(face);
  g.add(plateG);
  kit.hotspot(o.id, plateG, { lift: 0.22, baseY: plateG.position.y });
  kit.signs[o.id] = plateG;

  kit.add(g);
  return g;
}

/** A small hanging plaque mounted on a building wall (position in the building's frame). */
export function plaque(kit: WorldKit, { title, sub, w = 2.2, h = 0.86, accent = C.terracotta }: any) {
  const m = makeCard(roundRect(w, h, 0.08), {
    ...kit.card(0, 64),
    seed: 41,
    paint: plaquePaint(title, sub, accent),
    back: 'kraft',
    folds: [],
  });
  return m;
}

/* ------------------------------------------------------------------ buildings */

export interface VolumeOpts {
  w: number; d: number; h: number; x: number; z: number; seed?: number;
  wall?: ((P: any) => void) | ((P: any) => void)[];
  roof?: (P: any) => void;
  roofKind?: 'flat' | 'none' | 'pyramid';
  roofH?: number;
  px?: number;
  scale?: number;
  footprint?: [number, number][];
}

/** A folded volume on any plan (prismFold): walls are printed cards, the lid closes over them. */
export function foldedVolume(kit: WorldKit, o: VolumeOpts): THREE.Group {
  const px = o.px ?? 48;
  const paintWall = o.wall ? (Array.isArray(o.wall) ? o.wall : [o.wall]) : undefined;
  const g = prismFold(o.footprint || [[-o.w / 2, 0], [o.w / 2, 0], [o.w / 2, -o.d], [-o.w / 2, -o.d]], {
    h: o.h,
    roof: o.roofKind === 'none' ? 'none' : o.roofKind ?? 'flat',
    roofH: o.roofH ?? 2.4,
    paper: kit.paper,
    seed: o.seed ?? 5,
    thickness: 0.1,
    edgeWidth: 0.06,
    paints: { wall: paintWall, roof: o.roof },
    print: { pxPerUnit: px * (o.scale ?? 1), effects: 1 },
  });
  g.position.set(o.x, 0, o.z);
  if (o.scale) g.scale.setScalar(o.scale);
  kit.add(g);
  return g;
}

/** A gabled paper house (boxFold) — small stops, gatehouse, pavilion. */
export function gableHouse(kit: WorldKit, o: { w: number; d: number; h: number; roofH?: number; x: number; z: number; seed?: number; front?: (P: any) => void; gable?: (P: any) => void; roof?: (P: any) => void; px?: number; yaw?: number }) {
  const g = boxFold({
    w: o.w, d: o.d, wallH: o.h, roofH: o.roofH ?? o.w * 0.28,
    paper: kit.paper, seed: o.seed ?? 9,
    paints: { front: o.front, gable: o.gable, roof: o.roof },
    print: { pxPerUnit: o.px ?? 50, effects: 1 },
  });
  g.position.set(o.x, 0, o.z);
  g.rotation.y = o.yaw ?? 0;
  kit.add(g);
  return g;
}

/** A closed paper box (crates, planters, vents): printed front, kraft sides. */
export function printedBox(kit: WorldKit, { w, h, d, front, top, seed = 3 }: any) {
  const g = new THREE.Group();
  const px = 44;
  const canvas = printCard(rectPts(w, h), {
    pxPerUnit: px, paper: kit.paper, seed, paint: front, bleed: C.kraftEdge,
  });
  const tex = new THREE.CanvasTexture(canvas.canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = kit.paper.map.anisotropy;
  const bx = canvas.box;
  tex.repeat.set(1 / bx.w, 1 / bx.h); tex.offset.set(-bx.x0 / bx.w, -bx.y0 / bx.h);
  const frontMat = paperMaterial({ map: tex, normalMap: kit.paper.normalMap, normalScale: 0.6 });
  const topMat = kit.kraft(top || '#d8c19c');
  const sideMat = kit.kraft('#c3a077');
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [sideMat, sideMat, topMat, sideMat, frontMat, sideMat]);
  mesh.position.y = h / 2;
  mesh.castShadow = mesh.receiveShadow = true;
  g.add(mesh);
  // a printed lid line on top
  return g;
}

/* ------------------------------------------------------------------ trees + greenery */

export function treeTemplate(kit: WorldKit, seed = 1, kind: 'broad' | 'conifer' = 'broad') {
  const r = P2.rng(seed * 31 + 7);
  const trunkH = (kind === 'conifer' ? 0.8 : 1.4) + r() * 0.5;
  const crownR = (kind === 'conifer' ? 1.15 : 1.35) + r() * 0.45;
  const crownH = (kind === 'conifer' ? 3.2 : 2.1) + r() * 0.5;
  let pts: [number, number][];
  if (kind === 'broad') {
    pts = P2.shape.radial(r, { cy: trunkH + crownH * 0.52, rx: crownR, ry: crownH * 0.52, lobes: 7 + Math.round(r() * 3), depth: 0.26, wobble: 0.06, stalk: { w: 0.46, base: 0 } }) as [number, number][];
  } else {
    const tiers = 3;
    pts = [];
    const top = trunkH + crownH;
    pts.push([-0.22, 0], [0.22, 0]);
    for (let i = tiers - 1; i >= 0; i--) {
      const y0 = trunkH + (crownH / tiers) * i * 0.74;
      const half = crownR * (0.45 + 0.55 * (1 - i / tiers));
      pts.push([half * 0.2, y0]);
      pts.push([half, y0]);
      pts.push([0.12, y0 + crownH / tiers * 0.95]);
    }
    pts.push([0, top]);
    pts.push([-0.3, top - 0.4]);
    pts.reverse();
    pts = P2.roughen(pts.reverse(), r, { amp: 0.05, step: 0.14, keepBase: true }) as [number, number][];
    pts = pts.reverse();
  }
  const crownY = trunkH + crownH * 0.52;
  const paint = (P: any) => {
    P.fill(kind === 'conifer' ? C.sageDeep : C.sageDeep);
    // trunk: a fat tapered limb, a cut-paper layer
    P.layer((g: CanvasRenderingContext2D) => {
      g.fillStyle = C.kraftDark;
      P2.fillLimb(g, 0, 0, (r() - 0.5) * 0.2, trunkH * 0.6, 0, trunkH + 0.2, 0.5, 0.34, 8);
    }, C.kraftDark, { shadow: 1, lip: 1, shade: 1, rim: 0 });
    // an inner crown mass, a shade lighter
    P.layer((g: CanvasRenderingContext2D) => {
      g.fillStyle = C.sage;
      g.beginPath(); g.ellipse(0, crownY, crownR * 0.86, crownH * 0.44, 0, 0, Math.PI * 2); g.fill();
    }, C.sage, { shadow: 1, lip: 1, shade: 1, rim: 1 });
    // big countable leaves
    const colors = [C.grassLight, C.grass, C.sageDeep];
    colors.forEach((col, ci) => {
      P.layer((g: CanvasRenderingContext2D) => {
        g.fillStyle = col;
        const n = 7 + ci;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + ci * 0.7 + r() * 0.3;
          const rad = crownR * (0.36 + r() * 0.5);
          const x = Math.cos(a) * rad, y = crownY + Math.sin(a) * rad * 0.72;
          P2.fillLeaf(g, x, y, crownR * (0.42 + r() * 0.2), a + (r() - 0.5) * 1.2, 0.34);
        }
      }, col, { shadow: ci === 0 ? 0 : 1, lip: 1, shade: 1, rim: 0, depth: 0.8 });
    });
    // terracotta berries, the contrasting accent
    P.layer((g: CanvasRenderingContext2D) => {
      g.fillStyle = C.terracotta;
      for (let i = 0; i < 4; i++) {
        const a = r() * Math.PI * 2, rad = crownR * (0.2 + r() * 0.55);
        g.beginPath(); g.arc(Math.cos(a) * rad, crownY + Math.sin(a) * rad * 0.7, 0.1 + r() * 0.05, 0, Math.PI * 2); g.fill();
      }
    }, C.terracotta, { shadow: 0, lip: 1, shade: 1, rim: 0 });
  };
  const tree = crossCard(pts, {
    ...kit.card(0, 40),
    seed: seed + 3,
    thickness: 0.085,
    edgeWidth: 0.05,
    paint,
    back: 'mirror',
    angle: 90,
  });
  const g = new THREE.Group();
  g.add(tree);
  return g;
}

export function bushTemplate(kit: WorldKit, seed = 1) {
  const r = P2.rng(seed * 17 + 3);
  const w = 1.9 + r() * 0.7, h = 0.9 + r() * 0.35;
  const pts = P2.shape.mound(r, { w, h, lobes: 6 + Math.round(r() * 3), depth: 0.22 });
  const paint = (P: any) => {
    P.fill(C.sageDeep);
    P.layer((g: CanvasRenderingContext2D) => {
      g.fillStyle = C.sage;
      g.beginPath(); g.ellipse(0, h * 0.45, w * 0.36, h * 0.33, 0, 0, Math.PI * 2); g.fill();
    }, C.sage, { rim: 1, shadow: 1, lip: 1, shade: 1 });
    P.layer((g: CanvasRenderingContext2D) => {
      g.fillStyle = C.grassLight;
      for (let i = 0; i < 10; i++) P2.fillLeaf(g, (r() - 0.5) * w * 0.8, h * (0.28 + r() * 0.5), 0.34 + r() * 0.2, r() * 6.28, 0.34);
    }, C.grassLight, { shadow: 1, lip: 1, shade: 1, rim: 0 });
    P.layer((g: CanvasRenderingContext2D) => {
      g.fillStyle = C.terracotta;
      for (let i = 0; i < 5; i++) { g.beginPath(); g.arc((r() - 0.5) * w * 0.7, h * (0.32 + r() * 0.42), 0.08, 0, Math.PI * 2); g.fill(); }
    }, C.terracotta, { shadow: 0, lip: 1, shade: 0, rim: 0 });
  };
  const card = fanCard(pts, { ...kit.card(0, 38), seed: seed + 5, paint, back: 'kraft' });
  const g = new THREE.Group();
  g.add(card);
  return g;
}

export function lampTemplate(kit: WorldKit, seed = 1) {
  const g = new THREE.Group();
  const h = 3.1;
  const post = crossCard([[ -0.14, 0], [0.14, 0], [0.14, h], [0.32, h], [0.32, h + 0.55], [-0.32, h + 0.55], [-0.32, h], [-0.14, h]], {
    ...kit.card(0, 34),
    seed: seed + 11,
    thickness: 0.06,
    paint: (P: any) => { P.fill(C.graphite); P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = C.cream; g2.fillRect(-0.28, h + 0.18, 0.56, 0.28); }, C.cream, { rim: 0, shadow: 0 }); P.glow((g2: CanvasRenderingContext2D) => { g2.fillStyle = '#fff'; g2.fillRect(-0.28, h + 0.18, 0.56, 0.28); }); },
    back: 'kraft',
  });
  g.add(post);
  // a small warm pool of light printed as a disc on the ground (no extra light source)
  const pool = new THREE.Mesh(new THREE.CircleGeometry(0.9, 20), new THREE.MeshBasicMaterial({ color: '#ffdcaa', transparent: true, opacity: 0.16, depthWrite: false }));
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.05;
  g.add(pool);
  return g;
}

/* ------------------------------------------------------------------ small figures */

export function robotTemplate(kit: WorldKit, accent: string = C.terracotta) {
  const g = new THREE.Group();
  const body = crossCard(crossRect(0.78, 0.72), {
    ...kit.card(0, 44), seed: 61, thickness: 0.06,
    paint: (P: any) => {
      P.fill(C.creamDeep);
      P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = C.cream; g2.beginPath(); g2.ellipse(0, 0.42, 0.36, 0.26, 0, 0, Math.PI * 2); g2.fill(); }, C.cream, { rim: 1, shadow: 1 });
      P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = accent; g2.fillRect(-0.18, 0.12, 0.36, 0.16); }, accent, { rim: 0, shadow: 1 });
      P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = C.graphite; g2.fillRect(-0.28, 0.0, 0.2, 0.1); g2.fillRect(0.08, 0.0, 0.2, 0.1); }, C.graphite, { rim: 0, shadow: 1 });
    },
    back: 'mirror',
  });
  body.position.y = 0.12;
  g.add(body);
  const head = crossCard(roundRect(0.5, 0.36, 0.1).map(([x, y]) => [x, y + 0.88]), {
    ...kit.card(0, 52), seed: 63, thickness: 0.05,
    paint: (P: any) => {
      P.fill(C.ivory);
      P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = C.blueDeep; g2.fillRect(-0.2, 1.0, 0.16, 0.09); g2.fillRect(0.04, 1.0, 0.16, 0.09); }, C.blueDeep, { rim: 0, shadow: 0 });
      P.glow((g2: CanvasRenderingContext2D) => { g2.fillStyle = '#fff'; g2.fillRect(-0.2, 1.0, 0.16, 0.09); g2.fillRect(0.04, 1.0, 0.16, 0.09); });
    },
    back: 'mirror',
  });
  g.add(head);
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 5), kit.kraft(C.graphite));
  antenna.position.y = 1.32; antenna.castShadow = true;
  g.add(antenna);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: C.blueGlow }));
  tip.position.y = 1.44;
  g.add(tip);
  return g;
}

export function personTemplate(kit: WorldKit, coat: string = C.terracotta, seed = 1) {
  const g = new THREE.Group();
  const body = crossCard([[ -0.3, 0.3 ], [0.3, 0.3], [0.34, 0.95], [-0.34, 0.95]], {
    ...kit.card(0, 48), seed: seed + 71, thickness: 0.055,
    paint: (P: any) => {
      P.fill(coat);
      P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = C.cream; g2.fillRect(-0.3, 0.93, 0.6, 0.16); }, C.cream, { rim: 0, shadow: 1 });
      P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = C.graphite; g2.fillRect(-0.26, 0.06, 0.2, 0.28); g2.fillRect(0.06, 0.06, 0.2, 0.28); }, C.graphite, { rim: 0, shadow: 1 });
    },
    back: 'mirror',
  });
  g.add(body);
  const head = crossCard(P2.shape.radial(P2.rng(seed + 2), { cy: 1.18, rx: 0.24, ry: 0.25, lobes: 5, depth: 0.06 }), {
    ...kit.card(0, 56), seed: seed + 73, thickness: 0.05,
    paint: (P: any) => {
      P.fill('#e8c49b');
      P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = C.kraftDark; g2.fillRect(-0.24, 1.3, 0.48, 0.12); }, C.kraftDark, { rim: 0, shadow: 1 });
      P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = C.graphite; g2.fillRect(-0.11, 1.16, 0.05, 0.05); g2.fillRect(0.06, 1.16, 0.05, 0.05); }, C.graphite, { rim: 0, shadow: 0 });
    },
    back: 'mirror',
  });
  g.add(head);
  return g;
}

/* ------------------------------------------------------------------ factory fittings */

export function pipe(kit: WorldKit, { from, to, r = 0.22 }: { from: [number, number, number]; to: [number, number, number]; r?: number }) {
  const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
  const len = a.distanceTo(b);
  const geo = new THREE.CylinderGeometry(r, r, len, 10, 1, true);
  const mesh = new THREE.Mesh(geo, kit.kraft('#c7a071'));
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  mesh.castShadow = mesh.receiveShadow = true;
  // banded rings: the paper tube's wrapped collars
  const bands = Math.max(1, Math.floor(len / 2.4));
  for (let i = 1; i <= bands; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r * 1.06, r * 0.16, 5, 10), kit.kraft('#9a7247'));
    ring.position.copy(a).lerp(b, i / (bands + 1));
    ring.quaternion.copy(mesh.quaternion);
    ring.rotateX(Math.PI / 2);
    ring.castShadow = true;
    kit.add(ring);
  }
  return mesh;
}

export function dish(kit: WorldKit, { x = 0, y = 0, z = 0, r = 0.9, yaw = 0, tilt = -0.5 }: any) {
  const g = new THREE.Group();
  const card = makeCard(crossRect(r * 2, r * 2), {
    ...kit.card(0, 40), seed: 88, thickness: 0.06,
    paint: (P: any) => {
      P.fill(C.cream);
      P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = C.creamDeep; g2.beginPath(); g2.ellipse(0, r, r * 0.86, r * 0.72, 0, 0, Math.PI * 2); g2.fill(); }, C.creamDeep, { rim: 1, shadow: 1 });
      P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = C.kraftDeep; g2.beginPath(); g2.ellipse(0, r, r * 0.45, r * 0.38, 0, 0, Math.PI * 2); g2.fill(); }, C.kraftDeep, { rim: 1, shadow: 1 });
    },
    back: 'kraft',
  });
  card.rotation.x = tilt;
  g.add(card);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, r * 1.4, 6), kit.kraft('#8d6740'));
  mast.position.y = -r * 0.45; mast.castShadow = true;
  g.add(mast);
  g.position.set(x, y + r * 0.9, z);
  g.rotation.y = yaw;
  kit.add(g);
  return g;
}

export function antenna(kit: WorldKit, { x = 0, y = 0, z = 0, h = 2.2, seed = 1 }: any) {
  const g = new THREE.Group();
  const card = makeCard([[ -0.06, 0 ], [0.06, 0], [0.06, h], [-0.06, h]], {
    ...kit.card(0, 30), seed, thickness: 0.05,
    paint: (P: any) => { P.fill('#6a6157'); },
    back: 'kraft',
  });
  g.add(card);
  for (let i = 0; i < 3; i++) {
    const bar = makeCard([[ -0.55 + i * 0.06, h * (0.45 + i * 0.17) ], [0.55 - i * 0.06, h * (0.45 + i * 0.17)], [0.55 - i * 0.06, h * (0.47 + i * 0.17)], [-0.55 + i * 0.06, h * (0.47 + i * 0.17)]], {
      ...kit.card(0, 30), seed: seed + i, paint: (P: any) => { P.fill('#6a6157'); }, back: 'kraft',
    });
    g.add(bar);
  }
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: C.terracotta }));
  tip.position.y = h;
  g.add(tip);
  g.position.set(x, y, z);
  kit.add(g);
  return g;
}

export function flag(kit: WorldKit, { x = 0, y = 0, z = 0, color = C.terracotta, seed = 1 }: any) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3.0, 6), kit.kraft('#8d6740'));
  pole.position.y = 1.5; pole.castShadow = true;
  g.add(pole);
  const cloth = makeCard([[0, 0], [1.7, 0.28], [1.55, 1.0], [0.02, 0.86]], {
    ...kit.card(0, 44), seed, thickness: 0.04,
    paint: (P: any) => { P.fill(color); P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = C.ivory; g2.fillRect(0.42, 0.34, 0.5, 0.22); }, C.ivory, { rim: 0, shadow: 1 }); },
    back: 'kraft',
  });
  cloth.position.set(0.04, 2.1, 0);
  g.add(cloth);
  g.position.set(x, y, z);
  kit.add(g);
  kit.onStep((t) => { cloth.rotation.y = Math.sin(t * 0.9) * 0.12; cloth.rotation.z = Math.sin(t * 1.3 + 1) * 0.03; });
  return g;
}

export function cloudTemplate(kit: WorldKit, seed = 1, scale = 1) {
  const r = P2.rng(seed * 13);
  const pts = P2.shape.radial(r, { rx: 3.2, ry: 1.35, lobes: 6 + Math.round(r() * 2), depth: 0.2, wobble: 0.08 });
  const card = makeCard(pts.map(([x, y]) => [x, y - 1.3]), {
    ...kit.card(0, 34), seed, thickness: 0.05, effects: 1,
    paint: (P: any) => {
      P.fill(C.ivory);
      P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = C.cream; g2.beginPath(); g2.ellipse(0, 0.6, 2.4, 0.72, 0, 0, Math.PI * 2); g2.fill(); }, C.cream, { rim: 1, shadow: 1, lip: 1, shade: 1 });
    },
    back: 'kraft',
    folds: [],
  });
  card.scale.setScalar(scale);
  return card;
}

/* ------------------------------------------------------------------ dressing */

/** A striped paper awning over a shop door: one tilted card with a scalloped valance. */
export function awning(kit: WorldKit, { x, z, w = 3.4, d = 1.6, y = 2.2, color = C.terracotta, yaw = 0, seed = 1 }: any) {
  const g = new THREE.Group();
  const stripes = (P: any) => {
    P.fill(C.cream);
    P.layer((g2: CanvasRenderingContext2D) => {
      g2.fillStyle = color;
      const n = 7;
      for (let i = 0; i < n; i += 2) g2.fillRect(-w / 2 + (i / n) * w, 0, (w / n), d * 1.1);
    }, color, { rim: 0, shadow: 1, lip: 1, shade: 1 });
  };
  const card = makeCard([[ -w / 2, 0], [w / 2, 0], [w / 2, d], [-w / 2, d]], {
    ...kit.card(0, 48), seed: seed + 900, thickness: 0.06, paint: stripes, back: 'kraft', folds: [],
  });
  card.rotation.x = -1.12;
  g.add(card);
  // the valance: a scalloped strip hanging from the front edge
  const val = makeCard(P2.shape.waves(P2.rng(seed), { w, h: 0.4, crests: 7 }), {
    ...kit.card(0, 48), seed: seed + 901, thickness: 0.05,
    paint: (P: any) => { P.fill(color); P.marks('dot', { color: 'rgba(255,248,232,0.6)', size: 0.06, density: 1 }); },
    back: 'kraft',
  });
  val.rotation.x = -1.12;
  val.position.set(0, d * 0.86, d * 0.5);
  g.add(val);
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  kit.add(g);
  return g;
}

/** A rooftop plumbing set: vents, a duct, a skylight. Printed cards and kraft tubes. */
export function roofGear(kit: WorldKit, { x, z, y, w = 8, d = 4, seed = 1, skylights = 2 }: any) {
  const g = new THREE.Group();
  const r = P2.rng(seed * 53 + 5);
  for (let i = 0; i < 3; i++) {
    const vh = 0.5 + r() * 0.7;
    const vent = new THREE.Mesh(new THREE.CylinderGeometry(0.18 + r() * 0.12, 0.22 + r() * 0.12, vh, 7), kit.kraft('#b9a07c'));
    vent.position.set((r() - 0.5) * w * 0.8, y + vh / 2, (r() - 0.5) * d * 0.8);
    vent.castShadow = true;
    g.add(vent);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.26, 0.16, 7), kit.kraft('#8a6b47'));
    cap.position.set(vent.position.x, y + vh + 0.06, vent.position.z);
    cap.castShadow = true;
    g.add(cap);
  }
  // duct: a flat kraft box with a printed seam
  const duct = printedBox(kit, {
    w: 2.6, h: 0.55, d: 1.1, seed: seed + 11,
    front: (P: any) => { P.fill('#cbb79a'); P.innerShade('#5a3a20', { alpha: 0.25, blurPx: 6 }); P.marks('rivet', { color: 'rgba(255,246,228,0.6)', size: 0.22, density: 1 }); },
    top: '#bda88a',
  });
  duct.position.set(-w * 0.22, y, d * 0.22);
  g.add(duct);
  for (let i = 0; i < skylights; i++) {
    const sky = printedBox(kit, {
      w: 1.5, h: 0.22, d: 1.1, seed: seed + 20 + i,
      front: (P: any) => { P.fill(C.kraftDeep); },
      top: '#86a9b8',
    });
    sky.position.set(w * (0.18 + i * 0.2) - w * 0.3, y, -d * 0.2 + i * 1.5);
    g.add(sky);
  }
  kit.add(g);
  return g;
}

/** A planter: a kraft box with a bush, for plazas and aprons. */
export function planter(kit: WorldKit, { x, z, seed = 1, scale = 1 }: any) {
  const g = new THREE.Group();
  const box = printedBox(kit, {
    w: 1.6 * scale, h: 0.62 * scale, d: 1.0 * scale, seed: seed + 30,
    front: (P: any) => { P.fill(C.kraftDeep); P.innerShade('#5a3a20', { alpha: 0.3, blurPx: 8 }); P.marks('panel', { color: 'rgba(255,244,222,0.45)', size: 0.2, density: 0.8 }); },
    top: '#c9a475',
  });
  g.add(box);
  const b = bushTemplate(kit, seed + 31);
  b.position.y = 0.5 * scale;
  b.scale.setScalar(0.72 * scale);
  g.add(b);
  g.position.set(x, 0, z);
  kit.add(g);
  return g;
}

/** A bench: seat, back and two kraft legs. */
export function bench(kit: WorldKit, { x, z, yaw = 0, seed = 1 }: any) {
  const g = new THREE.Group();
  const seat = printedBox(kit, { w: 1.9, h: 0.16, d: 0.52, seed, front: (P: any) => { P.fill(C.kraft); P.marks('stripe', { color: 'rgba(120,84,48,0.4)', size: 0.2 }); }, top: '#c9a475' });
  seat.position.y = 0.4; g.add(seat);
  const back = printedBox(kit, { w: 1.9, h: 0.5, d: 0.12, seed: seed + 1, front: (P: any) => { P.fill(C.kraftDeep); }, top: '#b38a5b' });
  back.position.set(0, 0.56, -0.32); g.add(back);
  for (const sx of [-0.8, 0.8]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.46), kit.kraft('#8a6b47'));
    leg.position.set(sx, 0.2, 0); leg.castShadow = true; g.add(leg);
  }
  g.position.set(x, 0, z); g.rotation.y = yaw;
  kit.add(g);
  return g;
}

/** A barrel: kraft drum with printed bands. */
export function barrel(kit: WorldKit, { x, z, seed = 1, h = 1.4 }: any) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, h, 12), kit.kraft('#c7a071'));
  body.position.y = h / 2; body.castShadow = body.receiveShadow = true;
  g.add(body);
  for (const k of [0.3, 0.7]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.045, 4, 12), kit.kraft('#8a6b47'));
    ring.rotation.x = Math.PI / 2; ring.position.y = h * k;
    g.add(ring);
  }
  const top = new THREE.Mesh(new THREE.CircleGeometry(0.46, 12), kit.kraft('#e0c9a4'));
  top.rotation.x = -Math.PI / 2; top.position.y = h + 0.01;
  g.add(top);
  g.position.set(x, 0, z);
  kit.add(g);
  return g;
}

/* ------------------------------------------------------------------ conveyor station */

export function stationCard(kit: WorldKit, { index, label, icon, accent = C.terracotta }: any) {
  const m = makeCard(roundRect(2.45, 2.0, 0.16), {
    ...kit.card(0, 60), seed: 100 + index, thickness: 0.08,
    paint: (P: any) => {
      const { x0, y0, x1, y1 } = P.box;
      const w = x1 - x0, h = y1 - y0;
      P.fill(C.cream);
      plate(P, { x0: x0 + w * 0.05, y0: y0 + h * 0.34, x1: x1 - w * 0.05, y1: y1 - h * 0.06, color: C.ivory, rim: 0, shadow: 0.7, radius: 0.12 });
      plate(P, { x0: x0 + w * 0.05, y0: y0 + h * 0.06, x1: x1 - w * 0.05, y1: y0 + h * 0.32, color: accent, rim: 0, shadow: 0.6, radius: 0.08 });
      text(P, label, { y: y0 + h * 0.19, size: h * 0.14, color: C.ivory, font: '700', family: 'Menlo, monospace', track: 0.01 });
      // icon: a simple cut shape per station (kept countable)
      P.layer((g2: CanvasRenderingContext2D) => {
        g2.fillStyle = C.kraftDeep;
        g2.beginPath();
        if (icon === 'task') { g2.rect(-0.55, h * 0.5, 1.1, 0.72); }
        else if (icon === 'doc') { g2.rect(-0.5, h * 0.5, 1.0, 0.75); g2.rect(-0.3, h * 0.68, 0.6, 0.08); g2.rect(-0.3, h * 0.55, 0.4, 0.08); }
        else if (icon === 'box') { g2.rect(-0.5, h * 0.5, 1.0, 0.7); g2.rect(-0.06, h * 0.5, 0.12, 0.7); }
        else if (icon === 'test') { g2.rect(-0.5, h * 0.5, 0.28, 0.75); g2.rect(0.05, h * 0.5, 0.45, 0.28); }
        else if (icon === 'pr') { g2.arc(0, h * 0.72, 0.3, 0, Math.PI * 2); g2.rect(-0.12, h * 0.5, 0.24, 0.45); }
        else { g2.arc(0, h * 0.72, 0.34, 0, Math.PI * 2); }
        g2.fill();
      }, C.kraftDeep, { rim: 0, shadow: 1 });
      P.glow((g2: CanvasRenderingContext2D) => { g2.fillStyle = '#ffffff'; g2.fillRect(x0 + w * 0.1, y0 + h * 0.4, w * 0.8, h * 0.06); });
    },
    back: 'kraft',
    folds: [],
  });
  return m;
}

export { windows, screen, aiMark, kicker, text, plate };
