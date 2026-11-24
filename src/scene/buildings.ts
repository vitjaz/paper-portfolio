/**
 * Districts of the paper world. Each building is a folded volume with printed walls;
 * the factory is a composition of volumes, a conveyor stage and rooftop fittings.
 */
import * as THREE from 'three';
import * as P2 from '../papercraft/lib/paperkit-2d.js';
import * as PK3 from '../papercraft/lib/paperkit-3d.js';
const { makeCard, platform } = PK3 as any;
import { C } from './palette';
import {
  WorldKit, makeSign, plaque, foldedVolume, gableHouse, printedBox, treeTemplate, bushTemplate,
  lampTemplate, robotTemplate, personTemplate, pipe, dish, antenna, flag, stationCard, crossRect, roundRect,
  awning, roofGear,
} from './kit';
import { text, textAt, kicker, plate, windows, screen, aiMark } from './print';

const B = (P: any) => {
  const b = P.box;
  return { x0: b.x0, x1: b.x1, y0: b.y0, y1: b.y1, w: b.w, h: b.h };
};

/* ------------------------------------------------------------------ shared wall languages */

export function techWall(o: any = {}) {
  const {
    cols = 5, rows = 3, tone = C.cream, accent = C.terracotta, plinth = C.kraft, lit = 0.45,
    kickerText = null, big = null, mark = false, door = false, panel = true, seed = 1,
  } = o;
  return (P: any) => {
    const { x0, x1, y0, y1, w, h } = B(P);
    P.fill(tone);
    P.innerShade('#6a4526', { dx: 0.02, dy: -0.02, blurPx: 12, alpha: 0.2 });
    // plinth: a kraft base with panel seams
    plate(P, { x0, y0, x1, y1: y0 + h * 0.16, color: plinth, rim: 0, shadow: 0.7, radius: 0 });
    P.draw((g: CanvasRenderingContext2D) => {
      g.strokeStyle = 'rgba(90,58,32,0.32)'; g.lineWidth = 0.03;
      for (let x = x0 + w * 0.12; x < x1; x += w * 0.14) { g.beginPath(); g.moveTo(x, y0 + h * 0.03); g.lineTo(x, y0 + h * 0.14); g.stroke(); }
    });
    // window band: two tall rows, wide panes, thin dark mullions
    const wy0 = y0 + h * (door ? 0.34 : 0.28), wy1 = y0 + h * (big ? 0.66 : 0.72);
    if (panel) windows(P, { x0: x0 + w * 0.07, x1: x1 - w * 0.07, y0: wy0, y1: wy1, cols, rows: 2, lit, frame: C.graphite, pane: '#5f747c', glass: C.blueDeep });
    // a mid-floor band with tick marks: the floor plate reads as another cut layer
    plate(P, { x0, y0: y0 + h * 0.735, x1, y1: y0 + h * 0.78, color: accent, rim: 0, shadow: 0.6, radius: 0 });
    P.draw((g: CanvasRenderingContext2D) => {
      g.fillStyle = 'rgba(255,246,228,0.5)';
      for (let x = x0 + w * 0.03; x < x1; x += w * 0.045) g.fillRect(x, y0 + h * 0.742, w * 0.012, h * 0.02);
    });
    // vertical pilasters between bays
    P.layer((g: CanvasRenderingContext2D) => {
      g.fillStyle = C.kraft;
      const n = cols;
      for (let i = 0; i <= n; i++) {
        const x = x0 + w * 0.07 + (w * 0.86) * (i / n);
        g.fillRect(x - w * 0.004, y0 + h * 0.14, w * 0.008, h * 0.66);
      }
    }, C.kraft, { rim: 0, shadow: 0.6, depth: 0.7 });
    // parapet band
    plate(P, { x0, y0: y1 - h * 0.09, x1, y1, color: accent, rim: 0, shadow: 0.7, radius: 0 });
    P.draw((g: CanvasRenderingContext2D) => {
      g.fillStyle = 'rgba(255,246,228,0.35)';
      for (let x = x0; x < x1; x += w * 0.05) g.fillRect(x, y1 - h * 0.075, w * 0.018, h * 0.012);
    });
    if (door) {
      plate(P, { x0: x0 + w * 0.42, y0: y0, x1: x1 - w * 0.42, y1: y0 + h * 0.2, color: C.kraftDark, rim: 0, shadow: 0.8, radius: 0.04 });
      P.glow((g: CanvasRenderingContext2D) => { g.fillStyle = '#ffffff'; g.fillRect(x0 + w * 0.44, y0 + h * 0.02, w * 0.12, h * 0.16); });
    }
    // service detail: a downpipe, two louvred vents, panel seams and a stencil
    P.layer((g: CanvasRenderingContext2D) => {
      g.fillStyle = C.kraftDeep;
      g.fillRect(x0 + w * 0.035, y0 + h * 0.16, w * 0.012, h * 0.76);
      g.fillRect(x0 + w * 0.032, y0 + h * 0.56, w * 0.018, h * 0.02);
      for (let v = 0; v < 2; v++) {
        const vx = x0 + w * (0.18 + v * 0.55), vy = y0 + h * (0.86 - v * 0.04);
        for (let k = 0; k < 4; k++) g.fillRect(vx, vy + k * h * 0.012, w * 0.06, h * 0.005);
      }
    }, C.kraftDeep, { rim: 0, shadow: 0.8, lip: 1 });
    P.draw((g: CanvasRenderingContext2D) => {
      g.strokeStyle = 'rgba(90,58,32,0.22)'; g.lineWidth = w * 0.0015;
      for (let i = 1; i < 4; i++) { const yy = y0 + h * (0.16 + i * 0.128); g.beginPath(); g.moveTo(x0 + w * 0.05, yy); g.lineTo(x1 - w * 0.05, yy); g.stroke(); }
      textAt(g, 'T1 / ' + (seed % 7 + 1), x0 + w * 0.09, y0 + h * 0.88, h * 0.045, { color: 'rgba(255,246,228,0.65)', font: '700', family: 'Menlo, monospace', align: 'left', track: 0.02 });
    });
    if (mark) aiMark(P, { x: x1 - w * 0.12, y: y0 + h * 0.84, r: h * 0.055 });
    if (kickerText) kicker(P, kickerText, { x: x0 + w * 0.06, y: y0 + h * 0.87, size: h * 0.038, align: 'left', color: C.ivory });
    if (big) text(P, big, { y: y0 + h * 0.53, size: h * 0.2, color: C.ivory, font: '700', family: 'Menlo, monospace' });
  };
}

export function roofPaint(o: any = {}) {
  const { tone = '#c9bfa8', seams = true, label = null, seed = 1 } = o;
  return (P: any) => {
    const { x0, x1, y0, y1, w, h } = B(P);
    P.fill(tone);
    P.innerShade('#6a4526', { dx: 0.02, dy: -0.02, blurPx: 14, alpha: 0.16 });
    if (seams) {
      P.draw((g: CanvasRenderingContext2D) => {
        g.strokeStyle = 'rgba(120,92,60,0.22)'; g.lineWidth = 0.04;
        for (let i = 1; i < 6; i++) { const y = y0 + (h * i) / 6; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); }
        for (let i = 1; i < 8; i++) { const x = x0 + (w * i) / 8; g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y1); g.stroke(); }
      });
      // a few roof hatches and ducts as cut-paper patches
      const r = P.r;
      for (let i = 0; i < 3; i++) {
        const pw = w * (0.12 + r() * 0.08), ph = h * (0.1 + r() * 0.06);
        plate(P, { x0: x0 + w * (0.15 + r() * 0.6), y0: y0 + h * (0.2 + r() * 0.55), x1: x0 + w * (0.15 + r() * 0.6) + pw, y1: y0 + h * (0.2 + r() * 0.55) + ph, color: r() < 0.5 ? C.kraft : C.creamDeep, rim: 0, shadow: 1, radius: 0.08 });
      }
    }
    if (label) text(P, label, { y: y0 + h * 0.5, size: Math.min(h * 0.34, w * 0.16), color: 'rgba(120,88,54,0.42)', font: '700' });
  };
}

/* ------------------------------------------------------------------ the factory */

export function buildFactory(kit: WorldKit) {
  const factory = new THREE.Group();
  kit.add(factory);

  // main hall: front wall at z = 4, 24 wide
  const hall = foldedVolume(kit, {
    w: 24, d: 13, h: 10.6, x: 0, z: 4, seed: 71, roofKind: 'flat', px: 46,
    wall: [
      techWall({ cols: 7, rows: 3, rowsUnused: 0, lit: 0.5, mark: true, door: true, kickerText: 'INTERNAL AI PLATFORM' }),
      techWall({ cols: 3, rows: 3, lit: 0.3, seed: 2 }),
      techWall({ cols: 4, rows: 2, lit: 0.25, seed: 3 }),
      techWall({ cols: 4, rows: 3, lit: 0.3, seed: 4 }),
    ],
    roof: roofPaint({ label: 'T1', seed: 71 }),
  });
  kit.hotspot('factory', hall, { lift: 0 });

  // left wing
  foldedVolume(kit, {
    w: 9.5, d: 9, h: 7.0, x: -17, z: 2, seed: 73, roofKind: 'flat', px: 42,
    wall: [techWall({ cols: 3, rows: 2, tone: '#ece0c6', lit: 0.35, seed: 5 }), techWall({ cols: 2, rows: 2, seed: 6 }),
      techWall({ cols: 3, rows: 2, seed: 7 }), techWall({ cols: 3, rows: 2, seed: 8 })],
    roof: roofPaint({ tone: '#dbcfb6', seed: 73 }),
  });
  // right wing — the R&D side of the platform
  foldedVolume(kit, {
    w: 9, d: 9, h: 7.8, x: 16.5, z: 2, seed: 75, roofKind: 'flat', px: 42,
    wall: [techWall({ cols: 3, rows: 2, tone: '#eadfc4', lit: 0.5, seed: 9 }), techWall({ cols: 2, rows: 2, seed: 10 }),
      techWall({ cols: 3, rows: 2, seed: 11 }), techWall({ cols: 3, rows: 2, seed: 12 })],
    roof: roofPaint({ tone: '#dacdb2', seed: 75 }),
  });

  // the AI tower at the back: an eight-sided drum with a pyramid roof
  const oct: [number, number][] = Array.from({ length: 8 }, (_, i) => {
    const a = Math.PI * 0.25 + (i / 8) * Math.PI * 2;
    return [Math.cos(a) * 4.4, Math.sin(a) * 4.4];
  });
  const tower = foldedVolume(kit, {
    footprint: oct.map(([x, z]) => [x, z + 5]),
    w: 8.8, d: 8.8, h: 10.6, x: 0, z: -14, seed: 77, roofKind: 'pyramid', roofH: 3.4, px: 44,
    wall: [(P: any) => {
      const { x0, x1, y0, y1, w, h } = B(P);
      P.fill('#ebdfc4'); P.innerShade('#6a4526', { alpha: 0.22, blurPx: 14 });
      for (let i = 0; i < 3; i++) {
        const yy = y0 + h * (0.18 + i * 0.24);
        plate(P, { x0: x0 + w * 0.12, y0: yy, x1: x1 - w * 0.12, y1: yy + h * 0.1, color: C.blueDeep, rim: 0, shadow: 0.8, radius: 0.04 });
        P.glow((g: CanvasRenderingContext2D) => { g.fillStyle = '#ffffff'; g.fillRect(x0 + w * 0.15, yy + h * 0.02, w * 0.7, h * 0.06); });
      }
      plate(P, { x0, y0: y1 - h * 0.08, x1, y1, color: C.terracotta, rim: 0, shadow: 0.6, radius: 0 });
    }],
    roof: (P: any) => { P.fill('#c98f5a'); P.innerShade('#5a3a20', { alpha: 0.25, blurPx: 12 }); P.marks('panel', { color: 'rgba(120,84,48,0.35)', size: 0.9, density: 0.6 }); },
  });

  // a setback upper floor: the factory steps up instead of reading as one long shed
  const crownFloor = foldedVolume(kit, {
    w: 16.2, d: 8.2, h: 2.3, x: 0, z: 2.2, seed: 78, roofKind: 'flat', px: 50,
    wall: [
      (P: any) => {
        const { x0, x1, y0, y1, w, h } = B(P);
        P.fill('#e8dbc0');
        windows(P, { x0: x0 + w * 0.06, y0: y0 + h * 0.3, x1: x1 - w * 0.06, y1: y0 + h * 0.78, cols: 8, rows: 1, lit: 0.7, glass: C.blue });
        plate(P, { x0, y0: y1 - h * 0.2, x1, y1, color: C.terracotta, rim: 0, shadow: 0.6, radius: 0 });
        text(P, 'AI PLATFORM  ·  T1', { y: y0 + h * 0.16, size: h * 0.1, color: C.kraftDark, font: '700', family: 'Menlo, monospace', track: 0.06 });
      },
      techWall({ cols: 2, rows: 1, seed: 51 }), techWall({ cols: 3, rows: 1, seed: 52 }), techWall({ cols: 3, rows: 1, seed: 53 }),
    ],
    roof: roofPaint({ tone: '#d2c4a7', label: 'T1', seed: 78 }),
  });
  crownFloor.position.y = 10.6;
  kit.hotspot('factory', crownFloor, { lift: 0 });

  // the AI core: a glowing cold-blue panel on the upper floor, the factory's bright focal point
  const core = makeCard(roundRect(7.0, 2.35, 0.16), {
    ...kit.card(0, 72), seed: 79, thickness: 0.08,
    paint: (P: any) => {
      P.fill(C.graphite);
      plate(P, { x0: -3.3, y0: 0.2, x1: 3.3, y1: 2.15, color: '#17333f', rim: 0, shadow: 0, radius: 0.08 });
      aiMark(P, { x: -2.1, y: 1.18, r: 0.62, color: C.blueLight });
      text(P, 'AI CORE', { x: 1.0, y: 1.18, size: 0.66, color: '#cdefff', font: '700', family: 'Menlo, monospace', track: 0.08 });
    },
    back: 'kraft', folds: [], glowColor: '#5fc4e8', glow: 1.25,
  });
  core.position.set(0, 10.75, 2.28);
  factory.add(core);
  core.traverse((o: any) => { if (o.isMesh) { o.userData.hotspot = 'factory'; kit.pickables.push(o); } });
  kit.onStep((t) => { core.userData.setGlow?.(1.1 + 0.12 * Math.sin(t * 1.3 + 1.2)); });

  // side light strips on the hall's facade
  [-10.9, 10.9].forEach((x, i) => {
    const strip = makeCard(roundRect(0.55, 8.6, 0.12), {
      ...kit.card(0, 48), seed: 145 + i, thickness: 0.05,
      paint: (P: any) => { P.fill(C.terracotta); P.glow((g2: CanvasRenderingContext2D) => { g2.fillStyle = 'rgba(255,255,255,0.35)'; g2.fillRect(-0.1, 0.4, 0.2, 7.8); }); },
      back: 'kraft', folds: [],
    });
    strip.position.set(x, 1.4, 4.1);
    factory.add(strip);
  });

  // a paper railing along the hall's roof edge
  const railCard = (len: number, seed: number) => {
    const m = makeCard([[ -len / 2, 0 ], [len / 2, 0], [len / 2, 0.75], [-len / 2, 0.75]], {
      ...kit.card(0, 44), seed, thickness: 0.05,
      paint: (P: any) => {
        P.fill(C.kraftDeep);
        P.layer((g2: CanvasRenderingContext2D) => {
          g2.fillStyle = '#f2e6ce';
          g2.fillRect(-len / 2, 0.6, len, 0.12);
          for (let i = 0; i < Math.floor(len / 0.9); i++) g2.fillRect(-len / 2 + 0.3 + i * 0.9, 0, 0.1, 0.68);
        }, '#f2e6ce', { rim: 0, shadow: 1 });
      },
      back: 'kraft', folds: [],
    });
    return m;
  };
  const rail = railCard(23.6, 140); rail.position.set(0, 10.6, 9.9); factory.add(rail);
  const railL = railCard(12.4, 141); railL.rotation.y = Math.PI / 2; railL.position.set(-11.9, 10.6, 4.0); factory.add(railL);
  const railR = railCard(12.4, 142); railR.rotation.y = Math.PI / 2; railR.position.set(11.9, 10.6, 4.0); factory.add(railR);

  // the tower's reactor window: a big glowing paper dial facing the camera
  const dial = makeCard(roundRect(3.2, 3.2, 0.35), {
    ...kit.card(0, 60), seed: 79, thickness: 0.09,
    paint: (P: any) => {
      P.fill(C.graphite);
      plate(P, { x0: -1.35, y0: 0.3, x1: 1.35, y1: 2.9, color: C.blueDeep, rim: 0, shadow: 0, radius: 0.3 });
      aiMark(P, { y: 1.6, r: 0.82, color: C.blueLight });
      text(P, 'AI', { y: 0.62, size: 0.36, color: C.ivory, font: '700', family: 'Menlo, monospace', track: 0.06 });
    },
    back: 'kraft', folds: [],
  });
  dial.position.set(0, 7.0, -9.55);
  factory.add(dial);
  kit.hotspot('factory', dial, { lift: 0 });

  // big T1 sign on the hall's front, above the stage
  const t1 = makeCard(roundRect(9.0, 4.4, 0.26), {
    ...kit.card(0, 84), seed: 81, thickness: 0.11,
    paint: (P: any) => {
      const { x0, x1, y0, y1, w, h } = B(P);
      P.fill(C.terracotta);
      plate(P, { x0: x0 + w * 0.02, y0: y0 + h * 0.03, x1: x1 - w * 0.02, y1: y1 - h * 0.03, color: '#1d2f3b', rim: 0, shadow: 0.5, radius: 0.14 });
      P.layer((g: CanvasRenderingContext2D) => {
        g.fillStyle = 'rgba(120,190,220,0.22)';
        g.fillRect(x0 + w * 0.08, y0 + h * 0.42, w * 0.84, h * 0.02);
      }, '#78bedc', { rim: 0, shadow: 0.4 });
      P.layer((g: CanvasRenderingContext2D) => {
        textAt(g, 'T1', 0, y0 + h * 0.58, h * 0.55, { color: '#7fd4f2', font: '700' });
      }, '#bfeaff', { shadow: 1, lip: 1, shade: 1, rim: 0, depth: 0.8 });
      P.glow((g: CanvasRenderingContext2D) => {
        textAt(g, 'T1', 0, y0 + h * 0.58, h * 0.55, { color: '#ffffff', font: '700' });
      });
      text(P, 'AI PLATFORM', { y: y0 + h * 0.17, size: h * 0.12, color: '#d8f1ff', font: '700', family: 'Menlo, monospace', track: 0.1 });
    },
    back: 'kraft', folds: [], glowColor: '#5fc4e8', glow: 1.15,
  });
  t1.position.set(0, 6.5, 4.09);
  factory.add(t1);
  kit.hotspot('factory', t1, { lift: 0.05 });
  kit.onStep((t) => { t1.userData.setGlow?.(1.05 + 0.18 * Math.sin(t * 1.7) + 0.05 * Math.sin(t * 7.3)); });

  // banner over the conveyor
  const banner = makeCard(crossRect(11.5, 1.5), {
    ...kit.card(0, 64), seed: 83, thickness: 0.07,
    paint: (P: any) => {
      P.fill(C.kraftDark);
      plate(P, { x0: -5.5, y0: 0.12, x1: 5.5, y1: 1.38, color: '#3f3a33', rim: 0, shadow: 0.8, radius: 0.08 });
      text(P, 'AI AGENTS IN ACTION', { y: 0.78, size: 0.42, color: C.ivory, font: '700', family: 'Georgia, serif', track: 0.06 });
      P.glow((g: CanvasRenderingContext2D) => { g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(-5.1, 0.42, 10.2, 0.05); });
    },
    back: 'kraft', folds: [],
  });
  banner.position.set(0, 4.6, 4.1);
  factory.add(banner);
  kit.hotspot('agents', banner, { lift: 0 });

  // two live paper screens flanking the banner on the hall's facade
  [-10.2, 10.2].forEach((x, i) => {
    const panel = makeCard(roundRect(2.2, 1.5, 0.1), {
      ...kit.card(0, 64), seed: 140 + i, thickness: 0.06,
      paint: (P: any) => {
        P.fill(C.graphite);
        plate(P, { x0: -0.95, y0: 0.15, x1: 0.95, y1: 1.35, color: C.blueDeep, rim: 0, shadow: 0, radius: 0.06 });
        P.draw((g: CanvasRenderingContext2D) => {
          g.strokeStyle = C.blueLight; g.lineWidth = 0.05; g.beginPath();
          g.moveTo(-0.8, 0.45);
          for (let k = 1; k < 8; k++) g.lineTo(-0.8 + k * 0.22, 0.45 + 0.5 * Math.abs(Math.sin(k * 1.1 + i)));
          g.stroke();
        });
        P.glow((g: CanvasRenderingContext2D) => { g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillRect(-0.82, 0.28, 1.64, 0.9); });
      },
      back: 'kraft', folds: [],
    });
    panel.position.set(x, 4.9, 4.12);
    factory.add(panel);
    panel.traverse((o: any) => { if (o.isMesh) { o.userData.hotspot = 'factory'; kit.pickables.push(o); } });
  });

  // potted plants and a planter at the entrance corners
  const bushT = bushTemplate(kit, 5);
  [[-11.6, 5.6], [11.6, 5.6]].forEach(([x, z], i) => {
    const b = bushT.clone();
    b.position.set(x, 0, z); b.scale.setScalar(0.85); b.rotation.y = i * 0.8;
    factory.add(b);
    const box = printedBox(kit, {
      w: 1.5, h: 0.6, d: 0.9, seed: 31 + i,
      front: (P: any) => { P.fill(C.kraftDeep); P.innerShade('#5a3a20', { alpha: 0.3, blurPx: 8 }); P.marks('panel', { color: 'rgba(110,76,44,0.4)', size: 0.12, density: 0.8 }); },
      top: '#c9a475',
    });
    box.position.set(x, 0, z);
    factory.add(box);
  });

  // rooftop fittings
  const roofAt = (x: number, z: number, y = 10.6) => ({ x, z, y });
  const acUnit = (x: number, z: number, w = 2.4, d = 1.4, h = 0.9, seed = 1) => {
    const b = printedBox(kit, {
      w, h, d, seed,
      front: (P: any) => {
        P.fill('#d9cdb4'); P.innerShade('#5a3a20', { alpha: 0.25, blurPx: 8 });
        P.layer((g: CanvasRenderingContext2D) => { g.fillStyle = '#8a8378'; for (let i = 0; i < 5; i++) g.fillRect(-w * 0.36 + i * w * 0.15, h * 0.3, w * 0.09, h * 0.4); }, '#8a8378', { rim: 0, shadow: 1 });
      },
      top: '#c9bd9f',
    });
    b.position.set(x, 10.6, z);
    factory.add(b);
  };
  acUnit(-7.6, -6.5, 2.6, 1.6, 1.0, 101);
  acUnit(6.8, -5.2, 3.2, 1.8, 1.1, 102);
  acUnit(0.6, -8.6, 2.2, 1.4, 0.8, 103);
  antenna(kit, { x: -9.4, y: 10.6, z: -3.2, h: 2.4, seed: 111 });
  antenna(kit, { x: 9.2, y: 10.6, z: -6.2, h: 1.9, seed: 112 });
  dish(kit, { x: 5.0, y: 10.6, z: -8.6, r: 1.0, yaw: -0.4, tilt: -0.55 });
  flag(kit, { x: -3.4, y: 10.6, z: -8.9, color: C.terracotta, seed: 113 });
  roofGear(kit, { x: -9.4, z: -5.2, y: 10.6, w: 4.4, d: 3.2, seed: 120, skylights: 1 });
  roofGear(kit, { x: 9.2, z: -4.6, y: 10.6, w: 4.2, d: 3.2, seed: 121, skylights: 1 });
  roofGear(kit, { x: -17, z: -3.4, y: 7.0, w: 6, d: 4, seed: 122, skylights: 1 });
  roofGear(kit, { x: 16.5, z: -3.2, y: 7.8, w: 6, d: 4, seed: 123, skylights: 2 });
  roofGear(kit, { x: -5.0, z: -1.2, y: 12.9, w: 4.6, d: 3.4, seed: 124, skylights: 1 });
  roofGear(kit, { x: 5.2, z: -2.2, y: 12.9, w: 4.2, d: 3.2, seed: 125, skylights: 1 });

  // vent stacks and a pipe run down the right wing
  const stack = (x: number, z: number, h: number) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, h, 8), kit.kraft('#b9a07c'));
    m.position.set(x, h / 2, z); m.castShadow = m.receiveShadow = true;
    factory.add(m);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.46, 0.28, 8), kit.kraft('#8a6b47'));
    cap.position.set(x, h + 0.1, z); cap.castShadow = true;
    factory.add(cap);
  };
  stack(-8.8, -2.6, 4.2);
  stack(8.8, -1.4, 3.4);
  factory.add(pipe(kit, { from: [21.0, 2.2, -2.0], to: [21.0, 2.2, 1.6], r: 0.26 }));
  factory.add(pipe(kit, { from: [21.0, 2.2, 1.6], to: [17.2, 5.6, 1.8], r: 0.26 }));
  factory.add(pipe(kit, { from: [-21.0, 1.4, 0.4], to: [-21.0, 4.6, 0.4], r: 0.22 }));
  factory.add(pipe(kit, { from: [-21.0, 4.6, 0.4], to: [-17.4, 4.6, 0.4], r: 0.22 }));

  // IDE annex: a glass-fronted storefront on the left wing
  const annex = new THREE.Group();
  const annexWall = makeCard(roundRect(4.6, 3.6, 0.12), {
    ...kit.card(0, 62), seed: 121, thickness: 0.1,
    paint: (P: any) => {
      const { x0, x1, y0, y1, w, h } = B(P);
      P.fill(C.cream);
      plate(P, { x0: x0 + w * 0.06, y0: y0 + h * 0.08, x1: x1 - w * 0.06, y1: y1 - h * 0.06, color: C.blueDeep, rim: 0, shadow: 0.8, radius: 0.08 });
      P.draw((g: CanvasRenderingContext2D) => {
        textAt(g, 'IDE', 0, y0 + h * 0.52, h * 0.3, { color: C.blueLight, font: '700', family: 'Menlo, monospace' });
        textAt(g, 'VS CODE  ·  JETBRAINS', 0, y0 + h * 0.26, h * 0.09, { color: C.blueLight, font: '600', family: 'Menlo, monospace' });
      });
      P.glow((g: CanvasRenderingContext2D) => { g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(x0 + w * 0.12, y0 + h * 0.16, w * 0.76, h * 0.68); });
    },
    back: 'kraft', folds: [],
  });
  annexWall.position.set(-17, 0, 2.06);
  annex.add(annexWall);
  const canopy = makeCard([[ -2.8, 0 ], [2.8, 0], [2.4, 1.1], [-2.4, 1.1]], {
    ...kit.card(0, 48), seed: 122, thickness: 0.07,
    paint: (P: any) => { P.fill(C.terracotta); P.marks('stripe', { color: 'rgba(255,246,228,0.55)', size: 0.2, density: 1.2 }); },
    back: 'kraft',
  });
  canopy.rotation.x = -1.05;
  canopy.position.set(-17, 3.6, 2.5);
  annex.add(canopy);
  factory.add(annex);
  kit.hotspot('ide', annex, { lift: 0.1 });
  const idePlaque = plaque(kit, { title: 'IDE STATION', sub: '~4,000 users', accent: C.blueDeep });
  idePlaque.position.set(-17, 0.4, 2.12);
  idePlaque.scale.setScalar(1.0);
  factory.add(idePlaque);
  idePlaque.traverse((o: any) => { if (o.isMesh) { o.userData.hotspot = 'ide'; kit.pickables.push(o); } });

  // benchmark bench on the right wing roof: a chart board and an instrument
  const benchBoard = makeCard(roundRect(3.0, 2.0, 0.1), {
    ...kit.card(0, 64), seed: 131, thickness: 0.08,
    paint: (P: any) => {
      const { x0, x1, y0, y1, w, h } = B(P);
      P.fill(C.ivory);
      plate(P, { x0: x0 + w * 0.06, y0: y0 + h * 0.34, x1: x1 - w * 0.06, y1: y1 - h * 0.08, color: C.ivory, rim: 0, shadow: 0.4, radius: 0.05 });
      P.draw((g: CanvasRenderingContext2D) => {
        const bars = [0.4, 0.62, 0.5, 0.78];
        g.fillStyle = C.blue; for (let i = 0; i < 4; i++) g.fillRect(x0 + w * (0.15 + i * 0.19), y0 + h * 0.38, w * 0.1, h * bars[i] * 0.5);
        g.strokeStyle = C.terracotta; g.lineWidth = h * 0.02; g.beginPath();
        g.moveTo(x0 + w * 0.12, y0 + h * 0.5); g.lineTo(x0 + w * 0.42, y0 + h * 0.7); g.lineTo(x0 + w * 0.7, y0 + h * 0.62); g.lineTo(x0 + w * 0.92, y0 + h * 0.82); g.stroke();
      });
      text(P, 'BENCHMARKS', { y: y0 + h * 0.2, size: h * 0.13, color: C.graphite, font: '700', family: 'Menlo, monospace', track: 0.02 });
    },
    back: 'kraft', folds: [],
  });
  benchBoard.position.set(16.2, 7.2, 1.9);
  benchBoard.rotation.y = 0.06;
  factory.add(benchBoard);
  benchBoard.traverse((o: any) => { if (o.isMesh) { o.userData.hotspot = 'bench'; kit.pickables.push(o); } });
  kit.hotspot('bench', benchBoard, { lift: 0.12, pick: false });

  // security booth at the plaza's left entrance, with a barrier arm
  const booth = gableHouse(kit, {
    w: 2.6, d: 2.2, h: 2.4, roofH: 0.7, x: -15.2, z: 1.4, seed: 141, yaw: 0.18,
    front: (P: any) => {
      P.fill(C.cream);
      windows(P, { x0: -1.05, y0: 0.8, x1: 1.05, y1: 2.0, cols: 2, rows: 1, lit: 0.9, glass: C.blue });
      plate(P, { x0: -1.3, y0: 0.0, x1: 1.3, y1: 0.35, color: C.kraft, rim: 0, shadow: 0.6, radius: 0 });
      text(P, 'ACCESS', { y: 0.42, size: 0.2, color: C.graphite, font: '700', family: 'Menlo, monospace' });
    },
    gable: (P: any) => { P.fill(C.kraftDeep); },
    roof: (P: any) => { P.fill(C.terracotta); P.marks('stripe', { color: 'rgba(255,246,228,0.4)', size: 0.22, density: 0.8 }); },
    px: 54,
  });
  const barrier = new THREE.Group();
  const bar = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.16, 0.16), kit.kraft('#e8dcc2'));
  bar.position.set(1.8, 0, 0);
  barrier.add(bar);
  const barTip = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.18), kit.kraft(C.terracotta));
  barTip.position.set(3.5, 0, 0);
  barrier.add(barTip);
  barrier.position.set(-14.0, 1.5, 2.4);
  barrier.rotation.z = -0.06;
  kit.add(barrier);
  kit.onStep((t) => { barrier.rotation.z = -0.06 + Math.max(0, Math.sin(t * 0.22)) * 0.02; });
  kit.hotspot('security', booth, { lift: 0.1 });
  const secPlaque = plaque(kit, { title: 'SECURITY', sub: 'OAuth2 + PKCE', accent: C.graphite, w: 1.8, h: 0.8 });
  secPlaque.position.set(-15.2, 2.5, 2.55);
  kit.add(secPlaque);
  secPlaque.traverse((o: any) => { if (o.isMesh) { o.userData.hotspot = 'security'; kit.pickables.push(o); } });

  const conveyor = buildConveyor(kit);
  return { factory, conveyor };
}

/* ------------------------------------------------------------------ the conveyor */

export interface Conveyor {
  group: THREE.Group;
  stations: THREE.Mesh[];
  robots: THREE.Group[];
  run(): void;
  stop(): void;
  running: boolean;
  progress: number;
  onStage: ((i: number, label: string) => void) | null;
  onDone: (() => void) | null;
}

const STATIONS = [
  { label: 'TASK', icon: 'task' },
  { label: 'ANALYST', icon: 'doc' },
  { label: 'REQS', icon: 'doc' },
  { label: 'DEV', icon: 'box' },
  { label: 'SANDBOX', icon: 'box' },
  { label: 'TESTS', icon: 'test' },
  { label: 'PR', icon: 'pr' },
  { label: 'HUMAN', icon: 'human' },
];

export function buildConveyor(kit: WorldKit): Conveyor {
  const group = new THREE.Group();
  kit.add(group);

  const deck = platform({
    w: 26, d: 6.2, h: 1.7,
    paper: kit.paper, seed: 151,
    paints: {
      face: (P: any) => {
        P.fill(C.cream);
        plate(P, { x0: -13, y0: 0.72, x1: 13, y1: 1.28, color: C.terracotta, rim: 0, shadow: 0.8, radius: 0 });
        P.draw((g: CanvasRenderingContext2D) => {
          g.fillStyle = 'rgba(255,246,228,0.55)';
          for (let x = -12.6; x < 13; x += 1.5) g.fillRect(x, 0.86, 0.7, 0.3);
          textAt(g, 'AUTONOMOUS AGENT LINE', 0, 0.28, 0.26, { color: C.kraftDeep, font: '700', family: 'Menlo, monospace' });
        });
      },
      deck: (P: any) => {
        const { x0, x1, y0, y1, w, h } = B(P);
        P.fill('#d3c6ab');
        plate(P, { x0: x0 + w * 0.02, y0: y0 + h * 0.06, x1: x1 - w * 0.02, y1: y1 - h * 0.5, color: '#5c5448', rim: 0, shadow: 0.7, radius: 0.1 });
        P.draw((g: CanvasRenderingContext2D) => {
          g.strokeStyle = 'rgba(240,232,215,0.5)'; g.lineWidth = 0.06;
          for (let x = x0 - h; x < x1 + h; x += 1.0) {
            g.beginPath(); g.moveTo(x, y0 + h * 0.12); g.lineTo(x + h * 0.42, y1 - h * 0.56); g.stroke();
          }
        });
      },
      support: (P: any) => { P.fill(C.kraft); P.marks('panel', { color: 'rgba(110,76,44,0.4)', size: 0.34, density: 0.8 }); },
    },
    print: { pxPerUnit: 44, effects: 1 },
  });
  deck.position.set(0, 0, 13.0);
  group.add(deck);

  // the belt: a scrolling strip so the line reads as running even at rest
  const bc = document.createElement('canvas');
  bc.width = 256; bc.height = 64;
  const bg2 = bc.getContext('2d')!;
  bg2.fillStyle = '#4c463c'; bg2.fillRect(0, 0, 256, 64);
  bg2.strokeStyle = 'rgba(246,238,218,0.45)'; bg2.lineWidth = 6;
  for (let x = -64; x < 320; x += 32) { bg2.beginPath(); bg2.moveTo(x, 64); bg2.lineTo(x + 32, 0); bg2.stroke(); }
  const beltTex = new THREE.CanvasTexture(bc);
  beltTex.colorSpace = THREE.SRGBColorSpace;
  beltTex.wrapS = beltTex.wrapT = THREE.RepeatWrapping;
  beltTex.repeat.set(10, 1);
  beltTex.anisotropy = kit.paper.map.anisotropy;
  const belt = new THREE.Mesh(new THREE.PlaneGeometry(24.2, 1.85), new THREE.MeshLambertMaterial({ map: beltTex }));
  belt.rotation.x = -Math.PI / 2;
  belt.position.set(0, 1.712, 11.62);
  belt.receiveShadow = true;
  group.add(belt);

  // station cards stand behind the belt
  const stations: THREE.Mesh[] = [];
  const xs = STATIONS.map((_, i) => -9.8 + i * 2.8);
  STATIONS.forEach((s, i) => {
    const card = stationCard(kit, { index: i, label: s.label, icon: s.icon, accent: i === STATIONS.length - 1 ? C.blueDeep : C.terracotta });
    card.position.set(xs[i], 1.7, 10.1);
    card.rotation.x = 0.06;
    card.userData.idx = i;
    group.add(card);
    card.traverse((o: any) => { if (o.isMesh) o.userData.station = i; });
    card.userData.setGlow?.(0.35);
    stations.push(card);
  });
  // the human reviewer at the end of the line
  const reviewer = personTemplate(kit, C.kraftDeep, 9);
  reviewer.position.set(11.6, 1.7, 11.2);
  reviewer.rotation.y = -0.6;
  reviewer.scale.setScalar(1.15);
  group.add(reviewer);

  // robots: three workers on the belt, one moves per run
  const robots: THREE.Group[] = [];
  for (let i = 0; i < 5; i++) {
    const r = robotTemplate(kit, i % 3 === 1 ? C.blueDeep : C.terracotta);
    r.position.set([-9.6, -3.8, 2.0, 6.6, 9.2][i], 1.7, 11.9);
    r.rotation.y = 0.1 * (i - 2);
    r.scale.setScalar(1.18);
    group.add(r);
    robots.push(r);
  }

  // the play button: a paper disc with a cut triangle
  const play = makeCard(P2.shape.radial(P2.rng(5), { cy: 0.8, rx: 0.8, ry: 0.8, lobes: 14, depth: 0.03 }), {
    ...kit.card(0, 64), seed: 161, thickness: 0.08,
    paint: (P: any) => {
      P.fill(C.terracotta);
      P.layer((g: CanvasRenderingContext2D) => { g.fillStyle = C.ivory; g.beginPath(); g.moveTo(-0.18, 0.5); g.lineTo(0.36, 0.8); g.lineTo(-0.18, 1.1); g.closePath(); g.fill(); }, C.ivory, { rim: 0, shadow: 1 });
    },
    back: 'kraft',
  });
  play.position.set(12.7, 1.7, 13.0);
  play.scale.setScalar(1.15);
  group.add(play);
  play.traverse((o: any) => { if (o.isMesh) o.userData.hotspot = 'agents'; });

  const st = { running: false, t: 0, stage: -1, active: 0, moved: 0 };
  // the whole stage is the agent-factory affordance: deck, stations, belt, robots, the play disc
  group.traverse((o: any) => { if (o.isMesh && !o.userData.hotspot) { o.userData.hotspot = 'agents'; kit.pickables.push(o); } });
  const conv: Conveyor = {
    group, stations, robots, running: false, progress: 0, onStage: null, onDone: null,
    run() { st.running = true; st.t = 0; st.stage = -1; st.moved = 0; conv.running = true; conv.progress = 0; },
    stop() { st.running = false; conv.running = false; },
  };

  kit.onStep((time, dt) => {
    // belt scrolling is always alive, slow and quiet
    beltTex.offset.x = (beltTex.offset.x - dt * 0.045) % 1;
    const deckPrint = (deck.userData as any).deck;
    // stations idle at a low glow; the active one is hot
    for (let i = 0; i < stations.length; i++) {
      const lit = st.running && i === st.stage ? 1.9 : st.running && i < st.stage ? 0.9 : 0.32;
      stations[i].userData.setGlow?.(lit);
    }
    if (!st.running) {
      robots.forEach((r, i) => { r.position.y = 1.7 + Math.sin(time * 1.4 + i) * 0.01; });
      return;
    }
    st.t += dt;
    const per = 1.55;
    const idx = Math.min(STATIONS.length - 1, Math.floor(st.t / per));
    const local = (st.t - idx * per) / per;
    if (idx !== st.stage) {
      st.stage = idx;
      conv.onStage?.(idx, STATIONS[idx].label);
    }
    // the active robot walks from the previous station to this one, then works
    const active = robots[st.moved % robots.length];
    const from = xs[Math.max(0, idx - 1)], to = xs[idx];
    const x = idx === 0 ? to : from + (to - from) * Math.min(1, local / 0.72);
    active.position.x = x;
    active.position.y = 1.7 + Math.abs(Math.sin(time * 9)) * 0.045 * (local > 0.72 ? 1 : 0.35);
    active.rotation.y = 0.08 * Math.sin(time * 7);
    robots.forEach((r) => { if (r !== active) r.position.y = 1.7 + Math.sin(time * 1.6 + r.position.x) * 0.008; });
    conv.progress = Math.min(1, st.t / (per * STATIONS.length));
    if (st.t >= per * STATIONS.length) {
      st.running = false; conv.running = false; conv.progress = 1;
      conv.onDone?.();
    }
  }, { ambient: false });

  return conv;
}

/* ------------------------------------------------------------------ districts */

export function buildJourney(kit: WorldKit) {
  const g = new THREE.Group();
  kit.add(g);
  const remG = new THREE.Group();
  const quantG = new THREE.Group();
  const sistemG = new THREE.Group();
  g.add(remG, quantG, sistemG);

  /* REMTURBO — the power station */
  const rem = gableHouse(kit, {
    w: 5.4, d: 4.2, h: 3.5, roofH: 1.35, x: -28.6, z: 16.2, seed: 201, yaw: 0.22,
    front: (P: any) => {
      const { x0, x1, y0, y1, w, h } = B(P);
      P.fill('#ddc8a2');
      plate(P, { x0: x0 + w * 0.05, y0: y0, x1: x1 - w * 0.05, y1: y0 + h * 0.22, color: C.kraft, rim: 0, shadow: 0.6, radius: 0 });
      windows(P, { x0: x0 + w * 0.1, y0: y0 + h * 0.36, x1: x0 + w * 0.52, y1: y0 + h * 0.78, cols: 2, rows: 2, lit: 0.8, glass: C.blue });
      plate(P, { x0: x0 + w * 0.6, y0: y0 + h * 0.34, x1: x1 - w * 0.08, y1: y0 + h * 0.8, color: C.graphite, rim: 0, shadow: 0.8, radius: 0.05 });
      P.draw((g2: CanvasRenderingContext2D) => {
        g2.strokeStyle = C.blueLight; g2.lineWidth = 0.035;
        g2.beginPath(); g2.moveTo(x0 + w * 0.64, y0 + h * 0.44);
        for (let i = 1; i < 8; i++) g2.lineTo(x0 + w * 0.64 + i * w * 0.038, y0 + h * (0.44 + 0.24 * Math.sin(i * 1.1)));
        g2.stroke();
      });
      P.glow((g2: CanvasRenderingContext2D) => { g2.fillStyle = 'rgba(255,255,255,0.7)'; g2.fillRect(x0 + w * 0.62, y0 + h * 0.36, w * 0.3, h * 0.42); });
      text(P, 'REMTURBO', { y: y0 + h * 0.12, size: h * 0.1, color: C.graphite, font: '700', family: 'Menlo, monospace', track: 0.03 });
    },
    gable: (P: any) => { P.fill('#e2d3b4'); P.marks('brick', { color: 'rgba(150,110,70,0.3)', size: 0.3, density: 0.7 }); },
    roof: (P: any) => { P.fill(C.terracotta); P.marks('stripe', { color: 'rgba(255,246,228,0.35)', size: 0.3, density: 0.9 }); },
    px: 56,
  });
  remG.add(rem);
  const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 6.4, 9), kit.kraft('#cbb08a'));
  chimney.position.set(-30.6, 3.2, 14.4); chimney.castShadow = chimney.receiveShadow = true;
  remG.add(chimney);
  for (let i = 1; i <= 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.06, 5, 10), kit.kraft('#a8845a'));
    ring.rotation.x = Math.PI / 2; ring.position.set(-30.6, i * 1.55, 14.4); remG.add(ring);
  }
  remG.add(pipe(kit, { from: [-27.4, 1.1, 16.2], to: [-30.0, 1.1, 15.0], r: 0.16 }));
  const fan = new THREE.Group();
  for (let i = 0; i < 2; i++) {
    const blade = makeCard(roundRect(1.5, 0.5, 0.2).map(([x, y]) => [x, y + 0.2]), {
      ...kit.card(0, 44), seed: 210 + i, thickness: 0.05,
      paint: (P: any) => { P.fill('#8a8378'); P.innerShade('#2a241c', { alpha: 0.3, blurPx: 6 }); },
      back: 'kraft',
    });
    blade.rotation.z = i * Math.PI / 2;
    blade.position.set(0, 1.0, 0);
    fan.add(blade);
  }
  fan.position.set(-25.9, 2.3, 17.6); fan.rotation.y = 0.22;
  remG.add(fan);
  kit.onStep((t) => { fan.rotation.z = t * 1.1; });
  const remPlaque = plaque(kit, { title: '2021', sub: 'React · dashboard', w: 1.6, h: 0.72 });
  remPlaque.position.set(-26.4, 2.6, 18.0); remPlaque.rotation.y = 0.22;
  remG.add(remPlaque);
  kit.hotspot('remturbo', remG, { lift: 0.05 });
  awning(kit, { x: -28.4, z: 16.6, y: 2.0, w: 2.4, d: 0.9, color: C.sageDeep, seed: 532 });

  /* Квант — the platform workshop */
  const quantBld = foldedVolume(kit, {
    w: 6.6, d: 5.0, h: 4.4, x: -30.2, z: 6.4, seed: 221, roofKind: 'flat', px: 50,
    wall: [(P: any) => {
      const { x0, x1, y0, y1, w, h } = B(P);
      P.fill('#dcc59c');
      plate(P, { x0: x0 + w * 0.06, y0: y0 + h * 0.14, x1: x1 - w * 0.06, y1: y0 + h * 0.62, color: C.blueDeep, rim: 0, shadow: 0.9, radius: 0.06 });
      P.draw((g2: CanvasRenderingContext2D) => {
        g2.fillStyle = C.blueLight;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) g2.fillRect(x0 + w * (0.14 + i * 0.26), y0 + h * (0.22 + j * 0.2), w * 0.18, h * 0.12);
        g2.fillStyle = C.ivory; g2.fillRect(x0 + w * 0.12, y0 + h * 0.52, w * 0.72, h * 0.04);
      });
      P.glow((g2: CanvasRenderingContext2D) => { g2.fillStyle = 'rgba(255,255,255,0.65)'; g2.fillRect(x0 + w * 0.08, y0 + h * 0.16, w * 0.84, h * 0.44); });
      plate(P, { x0, y0: y1 - h * 0.1, x1, y1, color: C.terracotta, rim: 0, shadow: 0.6, radius: 0 });
      text(P, 'КВАНТ', { y: y0 + h * 0.76, size: h * 0.13, color: C.ivory, font: '700', family: 'Menlo, monospace', track: 0.05 });
    }, techWall({ cols: 2, rows: 2, seed: 13 }), techWall({ cols: 2, rows: 2, seed: 14 }), techWall({ cols: 2, rows: 2, seed: 15 })],
    roof: roofPaint({ tone: '#d8cbb0', seed: 221 }),
  });
  // crane
  const crane = new THREE.Group();
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 5.2, 6), kit.kraft('#8a6b47'));
  mast.position.set(0, 2.6, 0); crane.add(mast);
  const jib = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.16, 0.16), kit.kraft('#8a6b47'));
  jib.position.set(1.7, 5.1, 0); crane.add(jib);
  const cable = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.6, 0.03), kit.kraft('#6f5538'));
  cable.position.set(3.4, 4.2, 0); crane.add(cable);
  const hook = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.18), kit.kraft(C.terracotta));
  hook.position.set(3.4, 3.3, 0); crane.add(hook);
  crane.position.set(-30.6, 0, 4.0);
  quantG.add(crane);
  kit.onStep((t) => { crane.rotation.y = Math.sin(t * 0.18) * 0.5; });
  const crate = printedBox(kit, {
    w: 1.4, h: 1.1, d: 1.0, seed: 231,
    front: (P: any) => { P.fill(C.kraft); P.innerShade('#5a3a20', { alpha: 0.3, blurPx: 8 }); P.marks('panel', { color: 'rgba(255,244,222,0.5)', size: 0.14, density: 0.8 }); P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = C.cream; g2.fillRect(-0.62, 0.42, 1.24, 0.18); }, C.cream, { rim: 0, shadow: 1 }); },
    top: '#bb9468',
  });
  crate.position.set(-27.4, 0, 9.0);
  quantG.add(crate);
  const crate2 = crate.clone(); crate2.position.set(-28.2, 0, 10.1); crate2.rotation.y = 0.5; quantG.add(crate2);
  const quantPlaque = plaque(kit, { title: 'КВАНТ', sub: '2022–2024 · Vue 3', w: 1.9, h: 0.78 });
  quantPlaque.position.set(-28.0, 2.9, 8.1); quantPlaque.rotation.y = -0.2;
  quantG.add(quantPlaque);
  quantG.add(quantBld);
  kit.hotspot('quant', quantG, { lift: 0.05 });
  awning(kit, { x: -30.2, z: 6.55, y: 2.2, w: 2.6, d: 1.0, color: C.ochre, seed: 531 });

  /* 1221Системс — the CRM pavilion */
  const crm = gableHouse(kit, {
    w: 6.0, d: 4.6, h: 4.0, roofH: 1.4, x: -25.4, z: -13.6, seed: 241, yaw: 0.1,
    front: (P: any) => {
      const { x0, x1, y0, y1, w, h } = B(P);
      P.fill('#efe3c8');
      windows(P, { x0: x0 + w * 0.08, y0: y0 + h * 0.4, x1: x1 - w * 0.08, y1: y0 + h * 0.8, cols: 3, rows: 1, lit: 0.5, glass: C.blue });
      plate(P, { x0: x0 + w * 0.34, y0: y0, x1: x1 - w * 0.34, y1: y0 + h * 0.3, color: C.kraftDark, rim: 0, shadow: 0.8, radius: 0.04 });
      plate(P, { x0: x0 + w * 0.06, y0: y0 + h * 0.3, x1: x1 - w * 0.06, y1: y0 + h * 0.38, color: C.terracotta, rim: 0, shadow: 0.5, radius: 0 });
      text(P, '1221СИСТЕМС', { y: y0 + h * 0.18, size: h * 0.1, color: C.ivory, font: '700', family: 'Menlo, monospace', track: 0.03 });
    },
    gable: (P: any) => { P.fill('#e7d8b9'); },
    roof: (P: any) => { P.fill(C.terracotta); P.marks('scale', { color: 'rgba(255,246,228,0.35)', size: 0.34, density: 0.9 }); },
    px: 56,
  });
  // a stack of UI layers spilling out of the pavilion
  const layerStack = new THREE.Group();
  for (let i = 0; i < 3; i++) {
    const l = makeCard(roundRect(2.4, 1.6, 0.1), {
      ...kit.card(0, 52), seed: 250 + i, thickness: 0.05,
      paint: (P: any) => {
        P.fill(i === 0 ? C.terracotta : i === 1 ? C.cream : C.blueDeep);
        plate(P, { x0: -1.05, y0: 0.18, x1: 1.05, y1: 1.42, color: i === 2 ? C.blueLight : C.ivory, rim: 0, shadow: 0.5, radius: 0.06 });
      },
      back: 'kraft',
    });
    l.position.set(-22.0, 0.1 + i * 0.14, -11.2 - i * 0.18);
    l.rotation.set(-0.22, -0.35 + i * 0.12, 0.02);
    layerStack.add(l);
  }
  sistemG.add(layerStack, crm);
  kit.hotspot('sistem', sistemG, { lift: 0.05 });

  return g;
}

export function buildLabAndTower(kit: WorldKit) {
  const g = new THREE.Group();
  kit.add(g);

  /* R&D Lab / benchmarks */
  const lab = foldedVolume(kit, {
    w: 9.5, d: 7.2, h: 6.0, x: 24.6, z: -12.4, seed: 301, roofKind: 'flat', px: 46,
    wall: [
      (P: any) => {
        const { x0, x1, y0, y1, w, h } = B(P);
        P.fill('#ecdfc4');
        windows(P, { x0: x0 + w * 0.06, y0: y0 + h * 0.3, x1: x1 - w * 0.06, y1: y0 + h * 0.8, cols: 4, rows: 2, lit: 0.55, glass: C.blue });
        plate(P, { x0, y0: y1 - h * 0.09, x1, y1, color: C.blueDeep, rim: 0, shadow: 0.6, radius: 0 });
        text(P, 'R & D', { y: y0 + h * 0.16, size: h * 0.13, color: C.kraftDark, font: '700', family: 'Menlo, monospace', track: 0.08 });
      },
      techWall({ cols: 2, rows: 2, seed: 21 }), techWall({ cols: 3, rows: 2, seed: 22 }), techWall({ cols: 3, rows: 2, seed: 23 }),
    ],
    roof: roofPaint({ tone: '#d9ceb6', label: 'R&D', seed: 301 }),
  });
  dish(kit, { x: 28.2, y: 6.0, z: -14.2, r: 1.15, yaw: -0.5, tilt: -0.5 });
  antenna(kit, { x: 21.4, y: 6.0, z: -15.2, h: 3.0, seed: 303 });
  // an outside chart board with three model bars
  const chart = makeCard(roundRect(4.2, 2.6, 0.1), {
    ...kit.card(0, 68), seed: 305, thickness: 0.09,
    paint: (P: any) => {
      const { x0, x1, y0, y1, w, h } = B(P);
      P.fill(C.ivory);
      plate(P, { x0: x0 + w * 0.07, y0: y0 + h * 0.1, x1: x1 - w * 0.07, y1: y1 - h * 0.08, color: C.ivory, rim: 0, shadow: 0.4, radius: 0.04 });
      P.draw((g2: CanvasRenderingContext2D) => {
        g2.strokeStyle = 'rgba(90,58,32,0.4)'; g2.lineWidth = 0.03;
        for (let i = 1; i <= 4; i++) { const y = y0 + h * (0.1 + i * 0.16); g2.beginPath(); g2.moveTo(x0 + w * 0.1, y); g2.lineTo(x1 - w * 0.08, y); g2.stroke(); }
        const bars = [0.42, 0.66, 0.52];
        g2.fillStyle = C.blue;
        bars.forEach((b, i) => g2.fillRect(x0 + w * (0.18 + i * 0.26), y0 + h * 0.18, w * 0.16, h * b * 0.7));
        g2.fillStyle = C.terracotta; g2.fillRect(x0 + w * 0.18, y0 + h * 0.18 + h * 0.42 * 0.7 - h * 0.02, w * 0.16, h * 0.02);
      });
      text(P, 'OPENCODE · QWENCODE · HERMES', { y: y0 + h * 0.92, size: h * 0.09, color: C.graphite, font: '700', family: 'Menlo, monospace' });
      P.glow((g2: CanvasRenderingContext2D) => { g2.fillStyle = 'rgba(255,255,255,0.6)'; g2.fillRect(x0 + w * 0.12, y0 + h * 0.26, w * 0.76, h * 0.55); });
    },
    back: 'kraft', folds: [],
  });
  chart.position.set(23.4, 0.35, -6.9);
  chart.rotation.y = 0.04;
  g.add(chart);
  chart.traverse((o: any) => { if (o.isMesh) { o.userData.hotspot = 'bench'; kit.pickables.push(o); } });
  kit.hotspot('bench', lab, { lift: 0.1 });
  awning(kit, { x: 24.6, z: -11.55, y: 2.3, w: 2.8, d: 1.1, color: C.blueDeep, seed: 533 });
  roofGear(kit, { x: 25.4, z: -16.6, y: 6.0, w: 6, d: 3.6, seed: 534, skylights: 1 });

  /* MCP integration tower + three context bridges */
  const oct: [number, number][] = Array.from({ length: 8 }, (_, i) => {
    const a = Math.PI * 0.25 + (i / 8) * Math.PI * 2;
    return [Math.cos(a) * 3.3, Math.sin(a) * 3.3];
  });
  const tower = foldedVolume(kit, {
    footprint: oct,
    w: 6.6, d: 6.6, h: 10.4, x: 30.0, z: -2.0, seed: 311, roofKind: 'flat', px: 46,
    wall: [(P: any) => {
      const { x0, x1, y0, y1, w, h } = B(P);
      P.fill('#e7dabd');
      // vertical panel stripes: kraft ribs and pale panels, with narrow blue context slots
      for (let i = 0; i < 5; i++) {
        plate(P, { x0: x0 + w * (0.08 + i * 0.19), y0: y0 + h * 0.1, x1: x0 + w * (0.2 + i * 0.19), y1: y1 - h * 0.1, color: i % 2 ? C.kraft : '#f2e8d2', rim: 0, shadow: 0.5, radius: 0.03 });
      }
      for (let i = 0; i < 3; i++) {
        plate(P, { x0: x0 + w * 0.16, y0: y0 + h * (0.22 + i * 0.18), x1: x1 - w * 0.16, y1: y0 + h * (0.26 + i * 0.18), color: C.blueDeep, rim: 0, shadow: 0.4, radius: 0.02 });
      }
      P.glow((g2: CanvasRenderingContext2D) => { g2.fillStyle = 'rgba(255,255,255,0.8)'; g2.fillRect(x0 + w * 0.18, y0 + h * 0.24, w * 0.64, h * 0.03); });
      plate(P, { x0, y0: y1 - h * 0.1, x1, y1, color: C.terracotta, rim: 0, shadow: 0.5, radius: 0 });
      text(P, 'MCP', { x: 0, y: y0 + h * 0.88, size: h * 0.11, color: C.ivory, font: '700', family: 'Menlo, monospace', track: 0.1 });
    }],
    roof: (P: any) => { P.fill('#d5c7a9'); P.innerShade('#5a3a20', { alpha: 0.2, blurPx: 10 }); P.marks('panel', { color: 'rgba(120,88,54,0.28)', size: 0.6, density: 0.7 }); },
  });
  kit.hotspot('mcp', tower, { lift: 0.08 });
  // a small crown drum and three antennas on the flat lid
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.25, 0.7, 10), kit.kraft('#c3a77f'));
  crown.position.set(30.0, 10.75, -2.0); crown.castShadow = true;
  g.add(crown);
  antenna(kit, { x: 28.4, y: 10.4, z: -3.4, h: 3.2, seed: 314 });
  antenna(kit, { x: 31.6, y: 10.4, z: -1.2, h: 2.4, seed: 315 });
  dish(kit, { x: 31.4, y: 10.4, z: -3.8, r: 0.86, yaw: 0.6, tilt: -0.45 });

  const bridge = (y: number, label: string, w = 5.8, zOff = 0) => {
    const bg = new THREE.Group();
    const deck = new THREE.Mesh(new THREE.BoxGeometry(w, 0.26, 2.3), kit.kraft('#d6c5a4'));
    deck.castShadow = deck.receiveShadow = true;
    bg.add(deck);
    const railL = makeCard(roundRect(2.3, 0.62, 0.06), {
      ...kit.card(0, 44), seed: 320 + Math.round(y * 10), thickness: 0.05,
      paint: (P: any) => { P.fill(C.cream); P.marks('panel', { color: 'rgba(140,104,66,0.35)', size: 0.18, density: 0.7 }); },
      back: 'kraft',
    });
    railL.rotation.y = Math.PI / 2; railL.position.set(-w / 2 + 0.5, 0.32, 0);
    bg.add(railL);
    const railR = railL.clone(); railR.position.x = w / 2 - 0.5; bg.add(railR);
    // the printed channel label on the deck (read from above)
    const top = makeCard(roundRect(w - 0.7, 1.7, 0.08), {
      ...kit.card(0, 54), seed: 330 + Math.round(y * 10), thickness: 0.03,
      paint: (P: any) => {
        P.fill('#d3bd97');
        text(P, label, { y: 0.92, size: 0.78, color: C.graphite, font: '700', family: 'Menlo, monospace', track: 0.04 });
        P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = C.terracotta; for (let i = 0; i < 3; i++) g2.fillRect(-0.9 + i * 0.8, 0.24, 0.4, 0.22); }, C.terracotta, { rim: 0, shadow: 1 });
      },
      back: 'kraft',
    });
    top.rotation.x = -Math.PI / 2;
    top.position.set(0, 0.16, 0.16);
    bg.add(top);
    bg.position.set(30.0 - 3.3 - w / 2 + 0.1, y, -2.0 + zOff);
    g.add(bg);
  };
  bridge(8.6, 'TASK', 5.8, -1.2);
  bridge(6.8, 'CODE', 6.1, 0.7);
  bridge(5.0, 'DOCS', 5.6, 2.2);

  // signal beacon on the tower's crown
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), new THREE.MeshBasicMaterial({ color: C.blueGlow }));
  beacon.position.set(30.0, 11.6, -2.0);
  g.add(beacon);
  kit.onStep((t) => { const k = 0.75 + 0.25 * Math.sin(t * 1.6); (beacon.material as THREE.MeshBasicMaterial).color.setRGB(0.66 * k, 0.88 * k, 0.97 * k); });

  return g;
}

export function buildTelemetry(kit: WorldKit) {
  const g = new THREE.Group();
  kit.add(g);
  const bld = foldedVolume(kit, {
    w: 9.0, d: 6.0, h: 5.2, x: 23.8, z: 11.0, seed: 401, roofKind: 'flat', px: 46,
    wall: [
      (P: any) => {
        const { x0, x1, y0, y1, w, h } = B(P);
        P.fill('#d6c19a');
        windows(P, { x0: x0 + w * 0.06, y0: y0 + h * 0.3, x1: x1 - w * 0.06, y1: y0 + h * 0.74, cols: 4, rows: 2, lit: 0.4, glass: C.blue });
        plate(P, { x0: x0 + w * 0.04, y0: y0 + h * 0.78, x1: x1 - w * 0.04, y1: y1 - h * 0.02, color: C.graphite, rim: 0, shadow: 0.6, radius: 0.04 });
        P.draw((g2: CanvasRenderingContext2D) => {
          textAt(g2, 'HTTP · PG · KAFKA · S3', 0, y0 + h * 0.855, h * 0.055, { color: C.blueLight, font: '700', family: 'Menlo, monospace' });
        });
        P.glow((g2: CanvasRenderingContext2D) => { g2.fillStyle = 'rgba(255,255,255,0.65)'; g2.fillRect(x0 + w * 0.06, y0 + h * 0.8, w * 0.88, h * 0.05); });
        plate(P, { x0, y0: y1 - h * 0.05, x1, y1, color: C.blueDeep, rim: 0, shadow: 0.5, radius: 0 });
      },
      techWall({ cols: 2, rows: 2, seed: 31 }), techWall({ cols: 3, rows: 2, seed: 32 }), techWall({ cols: 3, rows: 2, seed: 33 }),
    ],
    roof: roofPaint({ tone: '#d8ccb2', label: 'LLM', seed: 401 }),
  });
  kit.hotspot('telemetry', bld, { lift: 0.1 });
  awning(kit, { x: 23.8, z: 11.8, y: 2.2, w: 2.6, d: 1.0, color: C.blueDeep, seed: 535 });
  roofGear(kit, { x: 23.8, z: 9.6, y: 5.2, w: 6, d: 3.2, seed: 536, skylights: 2 });

  // storage drums
  for (let i = 0; i < 3; i++) {
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 2.2, 12), kit.kraft('#cdb08a'));
    drum.position.set(29.4 + (i % 2) * 0.1, 1.1, 8.2 + i * 2.1);
    drum.castShadow = drum.receiveShadow = true;
    g.add(drum);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.07, 5, 12), kit.kraft('#9a7247'));
    ring.rotation.x = Math.PI / 2; ring.position.set(drum.position.x, 1.7, drum.position.z);
    g.add(ring);
    const top = new THREE.Mesh(new THREE.CircleGeometry(0.92, 12), kit.kraft('#e0c9a4'));
    top.rotation.x = -Math.PI / 2; top.position.set(drum.position.x, 2.21, drum.position.z);
    g.add(top);
  }
  g.add(pipe(kit, { from: [28.6, 1.4, 9.0], to: [28.6, 1.4, 5.6], r: 0.2 }));
  g.add(pipe(kit, { from: [28.6, 1.4, 5.6], to: [25.6, 1.4, 5.2], r: 0.2 }));
  // a tall gauge panel
  const gauge = makeCard(roundRect(2.2, 3.0, 0.16), {
    ...kit.card(0, 64), seed: 405, thickness: 0.08,
    paint: (P: any) => {
      P.fill(C.graphite);
      plate(P, { x0: -0.92, y0: 0.2, x1: 0.92, y1: 2.8, color: '#e8dfc8', rim: 0, shadow: 0.4, radius: 0.1 });
      P.draw((g2: CanvasRenderingContext2D) => {
        g2.strokeStyle = C.graphite; g2.lineWidth = 0.04; g2.beginPath(); g2.arc(0, 2.2, 0.62, Math.PI * 1.1, Math.PI * 1.9); g2.stroke();
        g2.strokeStyle = C.terracotta; g2.lineWidth = 0.06; g2.beginPath(); g2.moveTo(0, 2.2); g2.lineTo(0.32, 2.56); g2.stroke();
        textAt(g2, 'CALLS / DAY', 0, 1.42, 0.13, { color: C.graphite, font: '600', family: 'Menlo, monospace' });
        textAt(g2, '~10,000s', 0, 1.12, 0.15, { color: C.graphite, font: '700', family: 'Menlo, monospace' });
      });
      P.glow((g2: CanvasRenderingContext2D) => { g2.fillStyle = 'rgba(255,255,255,0.5)'; g2.fillRect(-0.8, 0.95, 1.6, 0.7); });
    },
    back: 'kraft', folds: [],
  });
  gauge.position.set(20.4, 0.2, 13.0);
  gauge.rotation.y = 0.1;
  g.add(gauge);
  gauge.traverse((o: any) => { if (o.isMesh) { o.userData.hotspot = 'telemetry'; kit.pickables.push(o); } });

  return g;
}

export function buildWorkshop(kit: WorldKit) {
  const g = new THREE.Group();
  kit.add(g);
  const shop = foldedVolume(kit, {
    w: 10.4, d: 7.0, h: 4.8, x: -23.0, z: 21.5, seed: 501, roofKind: 'flat', px: 44,
    wall: [
      (P: any) => {
        const { x0, x1, y0, y1, w, h } = B(P);
        P.fill('#d8c29b');
        // big open bay with a tool wall printed inside
        plate(P, { x0: x0 + w * 0.06, y0: y0, x1: x1 - w * 0.06, y1: y0 + h * 0.74, color: '#5a4a38', rim: 0, shadow: 0.9, radius: 0.1 });
        plate(P, { x0: x0 + w * 0.1, y0: y0 + h * 0.08, x1: x1 - w * 0.1, y1: y0 + h * 0.7, color: '#cbb492', rim: 0, shadow: 0.6, radius: 0.06 });
        P.draw((g2: CanvasRenderingContext2D) => {
          g2.strokeStyle = C.graphite; g2.lineWidth = 0.035;
          const tools = [[0.2, 0.5], [0.35, 0.62], [0.5, 0.48], [0.65, 0.6], [0.78, 0.5]];
          for (const [tx, ty] of tools) {
            const X = x0 + w * tx, Y = y0 + h * ty;
            g2.beginPath(); g2.moveTo(X, Y); g2.lineTo(X, Y + h * 0.12); g2.stroke();
            g2.beginPath(); g2.arc(X, Y + h * 0.14, 0.06, 0, Math.PI * 2); g2.stroke();
          }
          g2.fillStyle = C.terracotta; g2.fillRect(x0 + w * 0.14, y0 + h * 0.62, w * 0.11, h * 0.05);
          g2.fillStyle = C.blue; g2.fillRect(x0 + w * 0.3, y0 + h * 0.58, w * 0.08, h * 0.09);
        });
        plate(P, { x0: x0 + w * 0.06, y0: y0 + h * 0.78, x1: x1 - w * 0.06, y1: y1 - h * 0.06, color: C.terracotta, rim: 0, shadow: 0.6, radius: 0.05 });
        text(P, 'TECH STACK', { y: y0 + h * 0.88, size: h * 0.1, color: C.ivory, font: '700', family: 'Menlo, monospace', track: 0.08 });
        P.glow((g2: CanvasRenderingContext2D) => { g2.fillStyle = 'rgba(255,255,255,0.4)'; g2.fillRect(x0 + w * 0.12, y0 + h * 0.1, w * 0.3, h * 0.5); });
      },
      techWall({ cols: 2, rows: 2, seed: 41 }), techWall({ cols: 3, rows: 2, seed: 42 }), techWall({ cols: 3, rows: 2, seed: 43 }),
    ],
    roof: roofPaint({ tone: '#d9cdb3', label: 'WORKSHOP', seed: 501 }),
  });
  kit.hotspot('workshop', shop, { lift: 0.1 });
  awning(kit, { x: -23, z: 22.3, y: 3.4, w: 6.6, d: 1.5, color: C.terracotta, seed: 530 });
  roofGear(kit, { x: -23, z: 18.6, y: 4.8, w: 7, d: 4, seed: 537, skylights: 2 });
  kit.add(pipe(kit, { from: [-18.0, 0.8, 21.6], to: [-18.0, 4.6, 21.6], r: 0.18 }));

  // workbenches, crates and a tool cart
  const bench = printedBox(kit, {
    w: 3.0, h: 0.9, d: 1.2, seed: 511,
    front: (P: any) => { P.fill(C.kraft); P.innerShade('#5a3a20', { alpha: 0.25, blurPx: 8 }); P.marks('panel', { color: 'rgba(255,244,222,0.4)', size: 0.2, density: 0.6 }); },
    top: '#d8c3a0',
  });
  bench.position.set(-26.4, 0, 17.2); bench.rotation.y = 0.12; g.add(bench);
  const c1 = printedBox(kit, { w: 1.1, h: 1.0, d: 0.9, seed: 512, front: (P: any) => { P.fill(C.kraftDeep); P.marks('rivet', { color: 'rgba(255,244,222,0.55)', size: 0.3, density: 0.8 }); }, top: '#bb9468' });
  c1.position.set(-18.4, 0, 19.4); g.add(c1);
  const c2 = c1.clone(); c2.position.set(-19.3, 0, 20.1); c2.rotation.y = 0.4; c2.scale.setScalar(0.85); g.add(c2);
  const c3 = c1.clone(); c3.position.set(-17.8, 0, 20.4); c3.rotation.y = -0.2; c3.scale.setScalar(0.7); g.add(c3);
  // a small stack of "components": thin colored cards on a rack
  const rack = new THREE.Group();
  const cardCols = [C.terracotta, C.blue, C.sage, C.ochre, C.cream];
  cardCols.forEach((col, i) => {
    const c = makeCard(roundRect(1.2, 0.9, 0.04), {
      ...kit.card(0, 40), seed: 520 + i, thickness: 0.025,
      paint: (P: any) => { P.fill(col); P.draw((g2: CanvasRenderingContext2D) => { g2.fillStyle = 'rgba(255,250,238,0.55)'; g2.fillRect(-0.3, 0.5, 0.6, 0.12); }); },
      back: 'kraft',
    });
    c.position.set(0, 0, i * 0.22);
    c.rotation.x = -0.12;
    rack.add(c);
  });
  rack.position.set(-20.6, 0.1, 16.6); rack.rotation.y = -0.4; g.add(rack);
  return g;
}

export function buildAbout(kit: WorldKit) {
  const g = new THREE.Group();
  kit.add(g);
  const house = gableHouse(kit, {
    w: 5.0, d: 4.0, h: 3.3, roofH: 1.3, x: -25.4, z: -19.0, seed: 601, yaw: -0.12,
    front: (P: any) => {
      const { x0, x1, y0, y1, w, h } = B(P);
      P.fill('#efe4ca');
      windows(P, { x0: x0 + w * 0.12, y0: y0 + h * 0.38, x1: x1 - w * 0.12, y1: y0 + h * 0.76, cols: 2, rows: 1, lit: 0.9, glass: C.blue });
      plate(P, { x0: x0 + w * 0.38, y0: y0, x1: x1 - w * 0.38, y1: y0 + h * 0.3, color: C.kraftDark, rim: 0, shadow: 0.8, radius: 0.05 });
      plate(P, { x0: x0 + w * 0.26, y0: y0 + h * 0.78, x1: x1 - w * 0.26, y1: y1 - h * 0.05, color: C.terracotta, rim: 0, shadow: 0.6, radius: 0.04 });
      text(P, 'VITALIY', { y: y0 + h * 0.87, size: h * 0.09, color: C.ivory, font: '700', family: 'Menlo, monospace', track: 0.06 });
    },
    gable: (P: any) => { P.fill('#e7d8b8'); P.marks('brick', { color: 'rgba(150,110,70,0.25)', size: 0.3 }); },
    roof: (P: any) => { P.fill(C.sageDeep); P.marks('scale', { color: 'rgba(255,250,238,0.3)', size: 0.32, density: 0.8 }); },
    px: 56,
  });
  kit.hotspot('about', house, { lift: 0.1 });

  // park: trees, bench, a tiny figure
  const treeA = treeTemplate(kit, 601, 'broad');
  treeA.position.set(-28.6, 0, -15.2); treeA.scale.setScalar(1.1); g.add(treeA);
  const treeB = treeTemplate(kit, 602, 'broad');
  treeB.position.set(-21.6, 0, -15.6); treeB.scale.setScalar(0.9); g.add(treeB);
  const bush = bushTemplate(kit, 603);
  bush.position.set(-22.8, 0, -20.8); bush.scale.setScalar(0.9); g.add(bush);
  const bench = new THREE.Group();
  const seat = printedBox(kit, { w: 1.8, h: 0.16, d: 0.5, seed: 611, front: (P: any) => { P.fill(C.kraft); P.marks('stripe', { color: 'rgba(120,84,48,0.4)', size: 0.2 }); }, top: '#c9a475' });
  seat.position.y = 0.42; bench.add(seat);
  const back = printedBox(kit, { w: 1.8, h: 0.5, d: 0.12, seed: 612, front: (P: any) => { P.fill(C.kraftDeep); }, top: '#b38a5b' });
  back.position.set(0, 0.58, -0.3); bench.add(back);
  for (const sx of [-0.75, 0.75]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.42, 0.46), kit.kraft('#8a6b47'));
    leg.position.set(sx, 0.21, 0); bench.add(leg);
  }
  bench.position.set(-23.4, 0, -16.6); bench.rotation.y = 0.2; g.add(bench);
  const person = personTemplate(kit, C.terracotta, 3);
  person.position.set(-22.6, 0, -18.0); person.rotation.y = 2.4;
  g.add(person);
  return g;
}

export function buildContact(kit: WorldKit) {
  const g = new THREE.Group();
  kit.add(g);
  const post = gableHouse(kit, {
    w: 5.2, d: 4.0, h: 3.2, roofH: 1.25, x: 26.6, z: 21.8, seed: 701, yaw: -0.25,
    front: (P: any) => {
      const { x0, x1, y0, y1, w, h } = B(P);
      P.fill('#ddc8a2');
      windows(P, { x0: x0 + w * 0.1, y0: y0 + h * 0.36, x1: x0 + w * 0.46, y1: y0 + h * 0.76, cols: 1, rows: 1, lit: 0.9, glass: C.blue });
      plate(P, { x0: x0 + w * 0.54, y0: y0, x1: x1 - w * 0.08, y1: y0 + h * 0.4, color: C.terracottaDeep, rim: 0, shadow: 0.8, radius: 0.05 });
      P.draw((g2: CanvasRenderingContext2D) => {
        g2.strokeStyle = C.ivory; g2.lineWidth = 0.05;
        g2.strokeRect(x0 + w * 0.6, y0 + h * 0.12, w * 0.24, h * 0.16);
        g2.beginPath(); g2.moveTo(x0 + w * 0.6, y0 + h * 0.12); g2.lineTo(x0 + w * 0.72, y0 + h * 0.23); g2.lineTo(x0 + w * 0.84, y0 + h * 0.12); g2.stroke();
      });
      text(P, 'POST', { y: y0 + h * 0.86, size: h * 0.12, color: C.graphite, font: '700', family: 'Menlo, monospace', track: 0.1 });
    },
    gable: (P: any) => { P.fill('#e7d8b8'); },
    roof: (P: any) => { P.fill(C.terracotta); P.marks('stripe', { color: 'rgba(255,246,228,0.35)', size: 0.3, density: 0.9 }); },
    px: 56,
  });
  kit.hotspot('contact', post, { lift: 0.1 });
  awning(kit, { x: 26.4, z: 22.5, y: 2.1, w: 2.4, d: 0.9, color: C.terracottaDeep, seed: 731 });

  // the mailbox
  const mb = new THREE.Group();
  const box = printedBox(kit, {
    w: 1.0, h: 0.9, d: 0.6, seed: 711,
    front: (P: any) => {
      P.fill(C.terracottaDeep);
      P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = '#3a2418'; g2.fillRect(-0.3, 0.55, 0.6, 0.08); }, '#3a2418', { rim: 0, shadow: 0 });
      P.layer((g2: CanvasRenderingContext2D) => { g2.fillStyle = C.cream; g2.fillRect(-0.34, 0.24, 0.68, 0.14); }, C.cream, { rim: 0, shadow: 1 });
    },
    top: '#a2523a',
  });
  box.position.y = 1.0; mb.add(box);
  const pole = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.0, 0.14), kit.kraft('#8a6b47'));
  pole.position.y = 0.5; mb.add(pole);
  // little red flag
  const mflag = makeCard([[0, 0], [0.5, 0.18], [0.5, 0.42], [0, 0.3]], {
    ...kit.card(0, 40), seed: 712, thickness: 0.04,
    paint: (P: any) => { P.fill(C.terracotta); },
    back: 'kraft',
  });
  mflag.position.set(0.5, 1.45, 0.1); mb.add(mflag);
  mb.position.set(29.4, 0, 19.2); mb.rotation.y = -0.5; g.add(mb);
  mb.traverse((o: any) => { if (o.isMesh) { o.userData.hotspot = 'contact'; kit.pickables.push(o); } });
  kit.hotspot('contact', mb, { lift: 0.12, pick: false });

  // parcels and letters
  const parcel = printedBox(kit, { w: 0.9, h: 0.7, d: 0.7, seed: 721, front: (P: any) => { P.fill(C.kraft); P.marks('panel', { color: 'rgba(255,244,222,0.45)', size: 0.16 }); }, top: '#c9a475' });
  parcel.position.set(23.8, 0, 20.4); parcel.rotation.y = 0.3; g.add(parcel);
  const parcel2 = parcel.clone(); parcel2.position.set(24.6, 0, 21.4); parcel2.rotation.y = -0.4; parcel2.scale.setScalar(0.8); g.add(parcel2);
  const letter = makeCard(roundRect(0.9, 0.55, 0.03), {
    ...kit.card(0, 60), seed: 731, thickness: 0.03,
    paint: (P: any) => {
      P.fill(C.ivory);
      P.draw((g2: CanvasRenderingContext2D) => { g2.strokeStyle = C.kraftDeep; g2.lineWidth = 0.03; g2.strokeRect(-0.34, 0.1, 0.68, 0.35); g2.beginPath(); g2.moveTo(-0.34, 0.45); g2.lineTo(0, 0.22); g2.lineTo(0.34, 0.45); g2.stroke(); });
    },
    back: 'kraft',
  });
  letter.rotation.x = -Math.PI / 2 + 0.1; letter.position.set(26.2, 0.04, 18.4); letter.rotation.z = 0.3;
  g.add(letter);
  return g;
}
