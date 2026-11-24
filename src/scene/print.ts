/**
 * Print helpers: everything inside a card is ink on layered cut paper.
 * All coordinates are shape units (1 unit = 1 cm); y is up.
 *
 * The print context is y-up, but canvas text is always drawn y-down, so text is drawn
 * inside its own flipped frame (textAt): otherwise every label prints mirrored.
 */
import * as P2 from '../papercraft/lib/paperkit-2d.js';
import { C } from './palette';

type P = any;

export function light(): [number, number] {
  return [-0.55, 0.83];
}

/** Text in the print's y-up space: draws inside a flipped local frame so glyphs stay upright. */
export function textAt(g: CanvasRenderingContext2D, str: string, x: number, y: number, size: number, o: any = {}) {
  const { color = C.ink, font = '600', family = 'Georgia, "Times New Roman", serif', align = 'center', baseline = 'middle', track = 0, alpha = 1 } = o;
  g.save();
  g.translate(x, y);
  g.scale(1, -1);
  g.globalAlpha = alpha;
  g.fillStyle = color;
  g.font = `${font} ${size}px ${family}`;
  g.textBaseline = baseline;
  g.textAlign = track ? 'left' : align;
  if (!track) {
    g.fillText(str, 0, 0);
  } else {
    const chars = [...str];
    const widths = chars.map((ch) => g.measureText(ch).width + track);
    const total = widths.reduce((a, b) => a + b, 0) - track;
    let cx = align === 'center' ? -total / 2 : align === 'right' ? -total : 0;
    g.textAlign = 'left';
    chars.forEach((ch, i) => { g.fillText(ch, cx, 0); cx += widths[i]; });
  }
  g.restore();
}

/** Centred (or aligned) printed text. size in shape units. */
export function text(P: P, str: string, o: any = {}) {
  const { x = 0, y = 0, size = 0.6, ...rest } = o;
  P.draw((g: CanvasRenderingContext2D) => textAt(g, str, x, y, size, rest));
}

/** Uppercase tracked label, the paper sign kicker. */
export function kicker(P: P, str: string, o: any = {}) {
  text(P, str.toUpperCase(), { size: 0.32, font: '700', family: 'Menlo, "SF Mono", monospace', track: 0.055, ...o });
}

/** A cut-paper plate: layered rectangle with a pale cut edge and a soft shadow under it. */
export function plate(P: P, { x0, y0, x1, y1, color = C.cream, rim = 1, shadow = 1, radius = 0 }: any) {
  const w = x1 - x0, h = y1 - y0, r = Math.min(radius, w / 2, h / 2);
  P.layer((g: CanvasRenderingContext2D) => {
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(x0 + r, y0);
    g.lineTo(x1 - r, y0); g.quadraticCurveTo(x1, y0, x1, y0 + r);
    g.lineTo(x1, y1 - r); g.quadraticCurveTo(x1, y1, x1 - r, y1);
    g.lineTo(x0 + r, y1); g.quadraticCurveTo(x0, y1, x0, y1 - r);
    g.lineTo(x0, y0 + r); g.quadraticCurveTo(x0, y0, x0 + r, y0);
    g.closePath(); g.fill();
  }, color, { shadow, lip: 1, shade: 1, rim, depth: 0.9 });
}

/** Rows of framed windows, some lit. */
export function windows(P: P, { x0, y0, x1, y1, cols = 4, rows = 3, lit = 0.55, frame = C.graphite, pane = '#6b7f85', glass = C.blueDeep, seedGlow = 0.5 }: any) {
  const w = (x1 - x0) / cols, h = (y1 - y0) / rows;
  const litCells: number[][] = [];
  P.layer((g: CanvasRenderingContext2D) => {
    g.fillStyle = frame;
    g.fillRect(x0, y0, x1 - x0, y1 - y0);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const on = P.r() < lit;
      if (on) litCells.push([c, r]);
      g.fillStyle = on ? glass : pane;
      g.fillRect(x0 + c * w + w * 0.16, y0 + r * h + h * 0.18, w * 0.68, h * 0.62);
    }
  }, frame, { shadow: 1, lip: 1, shade: 1, rim: 0, depth: 0.8 });
  // lit panes as their own pale layers so the ink reads as paper
  for (const [c, r] of litCells) {
    plate(P, { x0: x0 + c * w + w * 0.2, y0: y0 + r * h + h * 0.22, x1: x0 + c * w + w * 0.8, y1: y0 + r * h + h * 0.76, color: '#7db6d0', rim: 1, shadow: 0, radius: 0 });
  }
  P.glow((g: CanvasRenderingContext2D) => {
    g.fillStyle = '#ffffff';
    for (const [c, r] of litCells) g.fillRect(x0 + c * w + w * 0.2, y0 + r * h + h * 0.22, w * 0.6, h * 0.54);
  });
}

/** A small lit screen with a chart or code lines, printed as paper layers plus an emissive pane. */
export function screen(P: P, { x0, y0, x1, y1, kind = 'chart', frame = C.graphite, seedChart = 1 }: any) {
  plate(P, { x0, y0, x1, y1, color: C.graphite, rim: 0, shadow: 1, radius: 0.12 });
  const bx0 = x0 + (x1 - x0) * 0.09, by0 = y0 + (y1 - y0) * 0.11, bx1 = x1 - (x1 - x0) * 0.09, by1 = y1 - (y1 - y0) * 0.11;
  plate(P, { x0: bx0, y0: by0, x1: bx1, y1: by1, color: C.blueDeep, rim: 0, shadow: 0, radius: 0.08 });
  const w = bx1 - bx0, h = by1 - by0;
  P.draw((g: CanvasRenderingContext2D) => {
    g.save();
    g.beginPath(); g.rect(bx0, by0, w, h); g.clip();
    g.fillStyle = C.blueLight;
    if (kind === 'chart') {
      const n = 5;
      for (let i = 0; i < n; i++) {
        const bh = h * (0.18 + 0.6 * Math.abs(Math.sin(seedChart * 1.7 + i * 1.3)));
        g.fillRect(bx0 + w * (0.1 + i * 0.18), by0 + h * 0.12, w * 0.1, bh);
      }
      g.strokeStyle = C.ivory; g.lineWidth = Math.max(h * 0.035, 0.02);
      g.beginPath(); g.moveTo(bx0 + w * 0.06, by0 + h * 0.3);
      for (let i = 1; i <= 6; i++) g.lineTo(bx0 + w * (0.06 + i * 0.15), by0 + h * (0.3 + 0.2 * Math.sin(i * 1.2 + seedChart)));
      g.stroke();
    } else if (kind === 'code') {
      const r = P.r;
      for (let i = 0; i < 7; i++) {
        const lw = w * (0.25 + r() * 0.62);
        g.fillRect(bx0 + w * 0.08, by0 + h * (0.14 + i * 0.11), lw, h * 0.045);
      }
    } else if (kind === 'flow') {
      g.strokeStyle = C.ivory; g.lineWidth = Math.max(h * 0.03, 0.02);
      g.beginPath(); g.moveTo(bx0 + w * 0.12, by0 + h * 0.5); g.lineTo(bx1 - w * 0.12, by0 + h * 0.5); g.stroke();
      for (let i = 0; i < 4; i++) {
        g.fillStyle = i % 2 ? C.blueLight : C.cream;
        g.beginPath(); g.arc(bx0 + w * (0.14 + i * 0.24), by0 + h * 0.5, w * 0.06, 0, Math.PI * 2); g.fill();
      }
    }
    g.restore();
  });
  P.glow((g: CanvasRenderingContext2D) => {
    g.fillStyle = '#ffffff';
    g.fillRect(bx0, by0, w, h);
  });
}

/** Three-ring AI indicator: cold blue only here. */
export function aiMark(P: P, { x = 0, y = 0, r = 0.5, color = C.blueLight } = {}) {
  P.layer((g: CanvasRenderingContext2D) => {
    g.strokeStyle = color; g.lineWidth = r * 0.16;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.arc(x, y, r * 0.58, 0, Math.PI * 2); g.stroke();
    g.fillStyle = color; g.beginPath(); g.arc(x, y, r * 0.24, 0, Math.PI * 2); g.fill();
  }, color, { shadow: 1, lip: 1, shade: 1, rim: 0, depth: 0.7 });
  P.glow((g: CanvasRenderingContext2D) => {
    g.strokeStyle = '#ffffff'; g.lineWidth = r * 0.16;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.stroke();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(x, y, r * 0.24, 0, Math.PI * 2); g.fill();
  });
}

/** Standing paper sign art: cream plate, terracotta ribbon, title + subtitle + explore arrow. */
export function signPaint(o: { title: string; sub?: string; kicker?: string; accent?: string; w?: number; h?: number }) {
  const accent = o.accent || C.terracotta;
  return (P: P) => {
    const { x0, y0, x1, y1 } = P.box;
    const w = x1 - x0, h = y1 - y0;
    P.fill(C.cream);
    P.innerShade('#6a4526', { dx: 0.02, dy: -0.02, blurPx: 14, alpha: 0.22 });
    // a kraft frame printed inside the cut, then a lighter inner sheet
    plate(P, { x0: x0 + w * 0.045, y0: y0 + h * 0.07, x1: x1 - w * 0.045, y1: y1 - h * 0.115, color: C.kraft, rim: 0, shadow: 0.6, radius: 0.16 });
    plate(P, { x0: x0 + w * 0.065, y0: y0 + h * 0.095, x1: x1 - w * 0.065, y1: y1 - h * 0.14, color: C.ivory, rim: 0, shadow: 0.8, radius: 0.12 });
    // ribbon header
    plate(P, { x0: x0 + w * 0.1, y0: y1 - h * 0.3, x1: x1 - w * 0.1, y1: y1 - h * 0.155, color: accent, rim: 0, shadow: 0.8, radius: 0.08 });
    if (o.kicker) text(P, o.kicker.toUpperCase(), { x: 0, y: y1 - h * 0.235, size: h * 0.105, font: '700', family: 'Menlo, monospace', color: C.ivory, track: 0.02 * w / 10 });
    const titleSize = h * (o.sub ? 0.235 : 0.3);
    text(P, o.title, { x: 0, y: y1 - h * (o.sub ? 0.47 : 0.44), size: Math.min(titleSize, w / Math.max(6, o.title.length * 0.52)), color: C.graphite, font: '700' });
    if (o.sub) text(P, o.sub, { x: 0, y: y1 - h * 0.66, size: h * 0.125, color: C.kraftDark, font: '500', family: '"Trebuchet MS", "Gill Sans", sans-serif' });
    // explore arrow in a small paper disc, bottom-right
    const ax = x1 - w * 0.17, ay = y0 + h * 0.17, ar = h * 0.095;
    P.layer((g: CanvasRenderingContext2D) => {
      g.fillStyle = accent;
      g.beginPath(); g.arc(ax, ay, ar, 0, Math.PI * 2); g.fill();
      g.strokeStyle = C.ivory; g.lineWidth = ar * 0.28; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); g.moveTo(ax - ar * 0.36, ay); g.lineTo(ax + ar * 0.34, ay);
      g.moveTo(ax + ar * 0.06, ay + ar * 0.36); g.lineTo(ax + ar * 0.4, ay); g.lineTo(ax + ar * 0.06, ay - ar * 0.36); g.stroke();
    }, accent, { shadow: 1, lip: 1, shade: 1, rim: 0, depth: 0.7 });
    kicker(P, 'Explore', { x: x0 + w * 0.17, y: y0 + h * 0.17, size: h * 0.085, color: C.kraftDark, align: 'left', track: 0.03 });
  };
}

/** Small hanging plaque on a building: kraft plate, ink text. */
export function plaquePaint(title: string, sub?: string, accent = C.terracotta) {
  return (P: P) => {
    const { x0, y0, x1, y1 } = P.box;
    const h = y1 - y0, w = x1 - x0;
    P.fill(accent);
    plate(P, { x0: x0 + w * 0.05, y0: y0 + h * 0.12, x1: x1 - w * 0.05, y1: y1 - h * 0.12, color: C.ivory, rim: 0, shadow: 0.6, radius: 0.06 });
    text(P, title, { y: y0 + h * (sub ? 0.58 : 0.5), size: h * (sub ? 0.34 : 0.44), color: C.graphite, font: '700' });
    if (sub) text(P, sub, { y: y0 + h * 0.33, size: h * 0.2, color: C.kraftDark, font: '500', family: '"Trebuchet MS", sans-serif' });
  };
}
