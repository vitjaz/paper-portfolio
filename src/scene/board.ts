/**
 * The physical base: a printed desk sheet, a torn paper mat, and a three-layer kraft platform
 * whose top is printed as one sheet of card — plaza tiles, roads with dashes, torn park patches,
 * footpaths and small printed marks. Nothing here is a UI card: it is the model's own ground.
 */
import * as THREE from 'three';
import * as P2 from '../papercraft/lib/paperkit-2d.js';
import * as PK3 from '../papercraft/lib/paperkit-3d.js';
const { paperMaterial } = PK3 as any;
import { C } from './palette';

export const BOARD = { w: 70, d: 52 };

export interface BoardBuild {
  group: THREE.Group;
  topY: number;
  /** world x/z -> `inside board` test */
  inside: (x: number, z: number, m?: number) => boolean;
}

const MAP = { x: BOARD.w / 2, z: BOARD.d / 2 };

function catmull(ctrl: [number, number][], closed = false, step = 0.6): [number, number][] {
  const pts: [number, number][] = [];
  const n = ctrl.length;
  const at = (i: number) => ctrl[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const steps = Math.max(2, Math.ceil(len / step));
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      pts.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  return pts;
}

/* the leading line: one ring road round the plaza, with two spurs to the quiet corners */
const RING = catmull([
  [-30, 25], [-26, 15], [-23, 5], [-20, -4], [-15, -12], [-5, -15.5], [7, -15], [16, -11.5], [21.5, -4], [22.5, 4], [20.5, 12], [14, 18.5], [2, 22], [-13, 23.5], [-24, 23],
], true);
const SPUR_CONTACT = catmull([[20.5, 12], [23.5, 16], [26, 20.5]]);
const SPUR_QUANT = catmull([[-22.5, 9], [-27, 6.5], [-31, 4]]);

function road(g: CanvasRenderingContext2D, pts: [number, number][], width: number, px: number) {
  const path = new Path2D();
  pts.forEach(([x, z], i) => (i ? path.lineTo((x + MAP.x) * px, (z + MAP.z) * px) : path.moveTo((x + MAP.x) * px, (z + MAP.z) * px)));
  g.save();
  g.lineJoin = 'round'; g.lineCap = 'round';
  g.strokeStyle = C.roadEdge; g.lineWidth = (width + 0.55) * px; g.stroke(path);
  g.strokeStyle = C.road; g.lineWidth = width * px; g.stroke(path);
  g.strokeStyle = C.roadDash; g.lineWidth = 0.16 * px; g.setLineDash([1.1 * px, 1.5 * px]); g.stroke(path);
  g.setLineDash([]);
  g.restore();
}

function tornPatch(g: CanvasRenderingContext2D, pts: [number, number][], color: string, px: number, r: () => number) {
  const rough = P2.roughen(pts, r, { amp: 0.5, step: 0.8, tear: 0.12, keepBase: false });
  const path = new Path2D();
  rough.forEach(([x, z], i) => (i ? path.lineTo((x + MAP.x) * px, (z + MAP.z) * px) : path.moveTo((x + MAP.x) * px, (z + MAP.z) * px)));
  path.closePath();
  g.save();
  g.shadowColor = 'rgba(90,58,32,0.18)'; g.shadowBlur = 6 * px / 24; g.shadowOffsetY = 5 * px / 24;
  g.fillStyle = color; g.fill(path);
  g.restore();
  // a pale fibrous fringe on the torn edge (the paper core)
  g.save();
  g.strokeStyle = 'rgba(255,248,232,0.55)'; g.lineWidth = Math.max(1, 0.1 * px);
  g.stroke(path);
  g.restore();
}

function rectPts(x0: number, z0: number, x1: number, z1: number, r = 1.2): [number, number][] {
  const out: [number, number][] = [];
  const corner = (cx: number, cz: number, a0: number, a1: number) => {
    for (let i = 0; i <= 6; i++) { const a = a0 + (a1 - a0) * (i / 6); out.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); }
  };
  corner(x1 - r, z0 + r, -Math.PI / 2, 0);
  corner(x1 - r, z1 - r, 0, Math.PI / 2);
  corner(x0 + r, z1 - r, Math.PI / 2, Math.PI);
  corner(x0 + r, z0 + r, Math.PI, Math.PI * 1.5);
  return out;
}

/** Print the whole board top into a canvas mapped 1:1 onto the platform's top face. */
export function printBoard(): HTMLCanvasElement {
  const px = 26;
  const W = Math.round(BOARD.w * px), H = Math.round(BOARD.d * px);
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  const r = P2.rng(11);
  const X = (x: number) => (x + MAP.x) * px;
  const Z = (z: number) => (z + MAP.z) * px;

  // base sheet, a warm cream card with a low-frequency wash
  g.fillStyle = C.board; g.fillRect(0, 0, W, H);
  const wash = g.createLinearGradient(0, 0, W * 0.7, H);
  wash.addColorStop(0, 'rgba(255,247,226,0.55)');
  wash.addColorStop(0.55, 'rgba(255,247,226,0)');
  wash.addColorStop(1, 'rgba(190,160,116,0.16)');
  g.fillStyle = wash; g.fillRect(0, 0, W, H);

  // a printed printed border: a thin kraft frame 1 unit inside the cut
  g.strokeStyle = 'rgba(160,124,82,0.55)'; g.lineWidth = 0.13 * px;
  g.strokeRect(0.9 * px, 0.9 * px, W - 1.8 * px, H - 1.8 * px);
  g.strokeStyle = 'rgba(255,249,235,0.5)'; g.lineWidth = 0.06 * px;
  g.strokeRect(1.05 * px, 1.05 * px, W - 2.1 * px, H - 2.1 * px);

  // region pads, torn paper patches
  tornPatch(g, rectPts(-18.4, -17.2, 16.6, 8.2, 2.4), C.plaza, px, r);              // factory plaza
  tornPatch(g, rectPts(-31, 10.5, -18.5, 22.5, 2), '#ded0ae', px, r);                 // workshop yard
  tornPatch(g, rectPts(17.2, 4.2, 30.5, 15.4, 2), '#e3d4b4', px, r);                  // telemetry pad
  tornPatch(g, rectPts(17.2, -22.5, 31.2, -9.6, 2), '#dcceac', px, r);                // lab pad
  tornPatch(g, rectPts(-31.6, -22.8, -16.4, -12.2, 2.2), C.grass, px, r);             // about park
  tornPatch(g, rectPts(-33.4, -13.5, -24.2, 9.6, 1.8), '#d8c9a6', px, r);             // journey lane
  tornPatch(g, rectPts(22.6, 17.6, 31.4, 24.8, 1.6), '#e0d1b0', px, r);               // contact pad
  tornPatch(g, rectPts(-16.5, 12.4, 16.5, 24.6, 2.2), '#e4d6b7', px, r);              // conveyor apron
  tornPatch(g, rectPts(-34, -25.6, 34, -21.0, 1.6), C.grass, px, r);                   // the back park strip
  tornPatch(g, rectPts(-34.4, -3.0, -32.0, 12.0, 1.2), C.grass, px, r);
  tornPatch(g, rectPts(32.2, -18.0, 34.2, -6.0, 1.0), C.grass, px, r);

  // plaza tiles (0.9 x 0.9 units) only inside the plaza, with a little hand-cut irregularity
  const tilePath = new Path2D();
  tilePath.rect(X(-18.2), Z(-17), 34.6 * px, 25 * px);
  g.save();
  g.clip(tilePath);
  g.strokeStyle = 'rgba(150,114,74,0.36)'; g.lineWidth = 0.075 * px;
  for (let x = -18.2; x < 16.6; x += 0.95) { g.beginPath(); g.moveTo(X(x), Z(-17)); g.lineTo(X(x), Z(8)); g.stroke(); }
  for (let z = -17; z < 8.2; z += 0.95) { g.beginPath(); g.moveTo(X(-18.2), Z(z)); g.lineTo(X(16.6), Z(z)); g.stroke(); }
  // a few tiles a shade lighter, like a replaced stone
  for (let i = 0; i < 26; i++) {
    const tx = -18 + Math.floor(r() * 35) * 0.95, tz = -16 + Math.floor(r() * 25) * 0.95;
    g.fillStyle = 'rgba(252,244,226,0.35)'; g.fillRect(X(tx + 0.05), Z(tz + 0.05), 0.85 * px, 0.85 * px);
  }
  g.restore();

  // roads
  road(g, RING, 3.1, px);
  road(g, SPUR_CONTACT, 2.4, px);
  road(g, SPUR_QUANT, 2.2, px);

  // crosswalk at the factory's front entrance
  g.save();
  g.fillStyle = 'rgba(255,249,235,0.9)';
  for (let i = 0; i < 7; i++) g.fillRect(X(-3.2 + i * 1.02), Z(8.9), 0.58 * px, 2.6 * px);
  g.restore();

  // footpaths: narrow dotted lines from the ring to each door
  const paths: [number, number][][] = [
    [[-14, 8], [-12, 5], [-11, 2]], [[14, 8], [12, 5], [11, 2]], [[-18, 16], [-14, 14], [-10, 12]],
    [[20, 12], [18, 14], [16, 15]], [[22, -10], [18, -9], [15, -8]], [[-27, 5], [-25, 5], [-22, 5]],
    [[-27, -1], [-25, -1], [-22, -1]], [[-24, -13], [-20, -13], [-17, -13]],
  ];
  g.save();
  g.strokeStyle = 'rgba(140,106,68,0.6)'; g.lineWidth = 0.1 * px; g.setLineDash([0.28 * px, 0.34 * px]);
  for (const p of paths) {
    const pts = catmull(p, false, 0.8);
    g.beginPath();
    pts.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z))));
    g.stroke();
  }
  g.restore();

  // printed greenery: grass tufts, flowers, small shrubs (3D trees stand over them)
  const tuft = (x: number, z: number, s: number, col: string) => {
    g.save(); g.translate(X(x), Z(z)); g.scale(s * px, s * px);
    g.strokeStyle = col; g.lineWidth = 0.035; g.lineCap = 'round';
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.28 + (r() - 0.5) * 0.1;
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(a) * 0.12, Math.sin(a) * 0.1, Math.cos(a) * 0.26, Math.sin(a) * 0.26); g.stroke();
    }
    g.restore();
  };
  const patches: [number, number, number, number][] = [[-31, -22, -17, -12], [-6, -19, 2, -16], [12, 19, 18, 23], [-32, 13, -25, 21], [23, 16, 30, 23]];
  for (const [x0, z0, x1, z1] of patches) {
    const n = Math.round((x1 - x0) * (z1 - z0) * 0.5);
    for (let i = 0; i < n; i++) {
      const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0);
      tuft(x, z, 0.8 + r() * 0.6, r() < 0.25 ? C.grassDeep : C.grassLight);
      if (r() < 0.16) {
        g.fillStyle = r() < 0.5 ? C.terracotta : C.ochre;
        g.beginPath(); g.arc(X(x), Z(z), 0.055 * px, 0, Math.PI * 2); g.fill();
      }
    }
  }
  // a printed shrub or two near the plaza edge
  for (let i = 0; i < 9; i++) {
    const x = (r() < 0.5 ? -1 : 1) * (17 + r() * 1.6), z = -14 + r() * 20;
    g.fillStyle = 'rgba(111,125,93,0.5)';
    g.beginPath(); g.ellipse(X(x), Z(z), (0.5 + r() * 0.4) * px, (0.35 + r() * 0.3) * px, r(), 0, Math.PI * 2); g.fill();
  }

  // printed plaza legend — small ink on the ground, a model's own marking
  g.save();
  g.translate(X(-2.0), Z(18.6)); g.rotate(-0.015);
  g.fillStyle = 'rgba(120,88,54,0.42)';
  g.font = `700 ${0.62 * px}px Georgia, serif`; g.textAlign = 'center';
  g.fillText('T 1   ·   A I   P L A T F O R M', 0, 0);
  g.strokeStyle = 'rgba(120,88,54,0.3)'; g.lineWidth = 0.06 * px;
  g.beginPath(); g.moveTo(-9 * px, 0.9 * px); g.lineTo(9 * px, 0.9 * px); g.stroke();
  g.restore();

  // hazard band along the conveyor apron, a printed safety marking
  g.save();
  g.beginPath(); g.rect(X(-13.6), Z(13.8), 27.2 * px, 0.9 * px); g.clip();
  for (let x = -15; x < 16; x += 1.1) {
    g.fillStyle = (Math.round(x * 2) % 2 === 0) ? 'rgba(176,86,58,0.5)' : 'rgba(246,238,218,0.75)';
    g.beginPath(); g.moveTo(X(x), Z(13.8)); g.lineTo(X(x + 0.6), Z(13.8)); g.lineTo(X(x + 1.2), Z(14.7)); g.lineTo(X(x + 0.6), Z(14.7)); g.closePath(); g.fill();
  }
  g.restore();

  // a printed compass rose on the quiet corner of the board
  g.save();
  g.translate(X(31.4), Z(24.0)); g.strokeStyle = 'rgba(120,88,54,0.42)'; g.fillStyle = 'rgba(120,88,54,0.42)'; g.lineWidth = 0.05 * px;
  g.beginPath(); g.arc(0, 0, 1.1 * px, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(0, 1.45 * px); g.lineTo(0.34 * px, 0); g.lineTo(0, -1.1 * px); g.lineTo(-0.34 * px, 0); g.closePath(); g.fill();
  g.font = `700 ${0.34 * px}px Menlo, monospace`; g.textAlign = 'center'; g.fillStyle = 'rgba(120,88,54,0.5)';
  g.fillText('N', 0, -1.35 * px);
  g.restore();

  // stamped district notes on the ground (quiet, countable marks)
  const stamps: [string, number, number, number][] = [
    ['JOURNEY', -29, 12.4, 0.3], ['R&D', 24.2, -8.4, -0.2], ['TELEMETRY', 22.6, 16.6, 0.25],
    ['WORKSHOP', -22.8, 24.4, 0.12], ['ABOUT', -25.8, -15.4, -0.15], ['CONTACT', 27.8, 24.4, 0.2],
  ];
  g.save();
  g.textAlign = 'center';
  for (const [label, x, z, angle] of stamps) {
    g.save(); g.translate(X(x), Z(z)); g.rotate(angle);
    g.fillStyle = 'rgba(120,88,54,0.32)';
    g.font = `700 ${0.26 * px}px Menlo, monospace`;
    g.fillText(label, 0, 0);
    g.restore();
  }
  g.restore();

  // manhole covers, drain lines, a few paper repairs
  for (let i = 0; i < 14; i++) {
    const x = -26 + r() * 52, z = -20 + r() * 40;
    g.strokeStyle = 'rgba(120,88,54,0.3)'; g.lineWidth = 0.04 * px;
    g.beginPath(); g.arc(X(x), Z(z), (0.2 + r() * 0.16) * px, 0, Math.PI * 2); g.stroke();
  }

  // front-edge print on the platform: the maker's mark
  g.save();
  g.fillStyle = 'rgba(255,248,232,0.55)';
  g.font = `600 ${0.3 * px}px Menlo, monospace`;
  g.textAlign = 'left';
  g.fillText('PAPER WORLD  /  VITALIY ALEXEEV  —  MODEL 01', X(-33.5), Z(25.3));
  g.restore();

  // quiet fibre over the whole sheet
  const sheet = P2.paperSheet({ size: 512, color: '#fff9ea', seed: 5, fibres: 1.2, mottle: 0.05 });
  const pat = g.createPattern(sheet, 'repeat');
  if (pat && pat.setTransform) pat.setTransform(new DOMMatrix().scale(0.5));
  if (pat) { g.save(); g.globalCompositeOperation = 'multiply'; g.globalAlpha = 0.85; g.fillStyle = pat; g.fillRect(0, 0, W, H); g.restore(); }
  return c;
}

export function buildBoard(scene: THREE.Scene, paper: any): BoardBuild {
  const group = new THREE.Group();
  group.name = 'platform';
  scene.add(group);

  const deskTex = new THREE.CanvasTexture(P2.paperSheet({ size: 512, color: '#efe3c9', seed: 19, fibres: 1.1, mottle: 0.06 }));
  deskTex.colorSpace = THREE.SRGBColorSpace;
  deskTex.wrapS = deskTex.wrapT = THREE.RepeatWrapping;
  deskTex.repeat.set(1 / 26, 1 / 26);
  deskTex.anisotropy = paper.map.anisotropy;
  const deskMat = new THREE.MeshBasicMaterial({ map: deskTex, color: '#bdae92' });
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), deskMat);
  desk.rotation.x = -Math.PI / 2;
  desk.position.y = -3.62;
  desk.receiveShadow = false;
  group.add(desk);

  // the platform's contact shadow: a soft printed stain, so no prop's shadow lands on the desk
  const shTex = document.createElement('canvas');
  shTex.width = shTex.height = 256;
  const sg = shTex.getContext('2d')!;
  const grad = sg.createRadialGradient(128, 128, 40, 128, 128, 126);
  grad.addColorStop(0, 'rgba(74,44,22,0.34)');
  grad.addColorStop(0.6, 'rgba(74,44,22,0.22)');
  grad.addColorStop(1, 'rgba(74,44,22,0)');
  sg.fillStyle = grad; sg.fillRect(0, 0, 256, 256);
  const shMap = new THREE.CanvasTexture(shTex);
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(92, 78), new THREE.MeshBasicMaterial({ map: shMap, transparent: true, depthWrite: false, opacity: 0.9 }));
  sh.rotation.x = -Math.PI / 2;
  sh.position.set(2, -3.6, 0);
  group.add(sh);

  // a torn mat sheet under the platform: real paper, slightly larger, its fibres showing at the cut
  const matPts = P2.roughen(rectPts(-41, -33, 41, 33, 3), P2.rng(4), { amp: 0.55, step: 1.1, tear: 0.16, keepBase: false });
  const matShape = new THREE.Shape(matPts.map(([x, z]) => new THREE.Vector2(x, z)));
  const matGeo = new THREE.ShapeGeometry(matShape);
  const mat = new THREE.Mesh(matGeo, new THREE.MeshBasicMaterial({ color: '#d8c9ab', map: deskTex }));
  mat.rotation.x = -Math.PI / 2;
  mat.position.y = -3.58;
  mat.receiveShadow = true;
  group.add(mat);

  // three stacked kraft boards: each layer is a little smaller, the cut edges carry the height
  const boardTex = new THREE.CanvasTexture(printBoard());
  boardTex.colorSpace = THREE.SRGBColorSpace;
  boardTex.anisotropy = paper.map.anisotropy;
  boardTex.generateMipmaps = true;

  const kraft = (tone: string) => paperMaterial({ color: tone, map: paper.map, normalMap: paper.normalMap, normalScale: 0.6 });
  const layers: { w: number; d: number; h: number; y: number; side: string; top?: THREE.Material }[] = [
    { w: 75.6, d: 57.6, h: 1.15, y: -3.58, side: '#b78f61' },
    { w: 72.8, d: 54.8, h: 1.2, y: -2.43, side: '#c19a6b' },
    { w: 70, d: 52, h: 1.23, y: -1.23, side: '#cba476' },
  ];
  layers.forEach((L, i) => {
    const topMat = kraft(L.side);
    const sideMat = kraft(L.side);
    const geo = new THREE.BoxGeometry(L.w, L.h, L.d);
    // BoxGeometry material order: +x, -x, +y, -y, +z, -z
    const mesh = new THREE.Mesh(geo, [sideMat, sideMat, topMat, sideMat, sideMat, sideMat]);
    mesh.position.set(0, L.y + L.h / 2, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    // a printed seam line on the side faces: the folded edge of the wrap
    const seam = new THREE.Mesh(new THREE.PlaneGeometry(L.w * 0.997, 0.1), paperMaterial({ color: '#8a613c' }));
    seam.position.set(0, L.y + 0.09, L.d / 2 + 0.002);
    group.add(seam);
  });

  // the printed board is its own sheet laid on the top board: a crisp printed surface with the
  // platform's kraft edge showing at the cut, exactly like a printed card glued to a base
  const topSheet = new THREE.Mesh(new THREE.PlaneGeometry(BOARD.w, BOARD.d), paperMaterial({ map: boardTex, normalMap: paper.normalMap, normalScale: 0.45 }));
  topSheet.rotation.x = -Math.PI / 2;
  topSheet.position.y = 0.012;
  topSheet.receiveShadow = true;
  group.add(topSheet);

  const topY = 0.012;

  const inside = (x: number, z: number, m = 0) => Math.abs(x) <= MAP.x - m && Math.abs(z) <= MAP.z - m;
  return { group, topY, inside };
}
