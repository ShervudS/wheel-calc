import { isStretched, tireWarning } from '../../core/tire/fit.ts';
import { sidewall } from '../../core/tire/size.ts';
import type { WheelState } from '../../core/types/wheelState.ts';
import { SPOKE_THICKNESS } from '../../core/wheel/constants.ts';
import { backspacing } from '../../core/wheel/geometry.ts';
import type { Translate } from '../../i18n/types.ts';
import { escapeXml } from '../../util/escape.ts';
import { lenText, mmText, signedEt } from '../utils/format.ts';
import {
  ACC,
  CX,
  CY,
  FLANGE_H,
  R_PAD,
  R_SPOKE,
  SIDES,
  VIEW_H,
  VIEW_W,
  WELL_DEPTH,
} from './constants.ts';
import { projection } from './geometry.ts';
import type { DragKey, Pt, RenderView, Side, SvgLayers } from './types.ts';

const n = (v: number) => String(Math.round(v * 100) / 100);

function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  stroke: string,
  width = 1,
  dash?: string,
): string {
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${stroke}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
}

function hitLine(k: DragKey, x1: number, y1: number, x2: number, y2: number, cursor: string) {
  return `<line x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="transparent" stroke-width="24" class="hit-area" data-k="${k}" style="cursor:${cursor}"/>`;
}

function accent(x1: number, y1: number, x2: number, y2: number, width: number): string {
  return `<line pointer-events="none" stroke-linecap="round" x1="${n(x1)}" y1="${n(y1)}" x2="${n(x2)}" y2="${n(y2)}" stroke="${ACC}" stroke-width="${width}"/>`;
}

function arrowsH(x: number, y: number): string {
  return `<path pointer-events="none" d="M${n(x - 17)},${n(y)}L${n(x - 8)},${n(y - 7)}L${n(x - 8)},${n(y + 7)}ZM${n(x + 17)},${n(y)}L${n(x + 8)},${n(y - 7)}L${n(x + 8)},${n(y + 7)}Z" fill="${ACC}" stroke="var(--panel)" stroke-width="1.5"/>`;
}

function arrowsV(x: number, y: number): string {
  return `<path pointer-events="none" d="M${n(x)},${n(y - 17)}L${n(x - 7)},${n(y - 8)}L${n(x + 7)},${n(y - 8)}ZM${n(x)},${n(y + 17)}L${n(x - 7)},${n(y + 8)}L${n(x + 7)},${n(y + 8)}Z" fill="${ACC}" stroke="var(--panel)" stroke-width="1.5"/>`;
}

function hotLabel(x: number, y: number, txt: string): string {
  return `<text pointer-events="none" x="${n(x)}" y="${n(y)}" font-size="13" font-weight="600" text-anchor="middle" style="fill:var(--acct);paint-order:stroke;stroke:var(--panel);stroke-width:5px;stroke-linejoin:round">${escapeXml(txt)}</text>`;
}

function dim(x1: number, y1: number, x2: number, y2: number, txt: string, up = false): string {
  return (
    line(x1, y1, x2, y2, 'var(--ink)') +
    line(x1, y1 - 6, x1, y1 + 6, 'var(--ink)') +
    line(x2, y2 - 6, x2, y2 + 6, 'var(--ink)') +
    `<text x="${n((x1 + x2) / 2)}" y="${n(y1 + (up ? -8 : 18))}" font-size="13" text-anchor="middle">${escapeXml(txt)}</text>`
  );
}

export function renderWheel(s: Readonly<WheelState>, view: RenderView, t: Translate): SvgLayers {
  const { gx, gy, scale } = projection(view.scale);
  const R = s.D / 2;
  const h = s.W / 2;
  const { ET, X } = s;
  const rw = R - WELL_DEPTH;
  const sw = sidewall(s.tw, s.ta);
  const rTop = s.tire ? R + sw : R + FLANGE_H;
  const L = (mm: number) => lenText(mm, view.unit, t);
  const M = (mm: number) => mmText(mm, t);
  const path = (pts: readonly Pt[], sg: Side, close = false) =>
    'M' + pts.map(([x, q]) => `${n(gx(x))},${n(gy(q, sg))}`).join('L') + (close ? 'Z' : '');

  // Barrel profile: flange, bead seat, drop into the well and back.
  const barrel: Pt[] = [
    [-h, R + FLANGE_H],
    [-h, R + 3],
    [-h + 7, R],
    [-h + 24, R],
    [-h + 30, R - 4],
    [-h + 40, rw],
    [h - 40, rw],
    [h - 30, R - 4],
    [h - 24, R],
    [h - 7, R],
    [h, R + 3],
    [h, R + FLANGE_H],
  ];
  const xi = ET + X;
  const xo = xi + SPOKE_THICKNESS;
  const spoke: Pt[] = [
    [ET, R_PAD],
    [xi, R_SPOKE],
    [xi, rw],
    [xo, rw],
    [xo, -rw],
    [xi, -rw],
    [xi, -R_SPOKE],
    [ET, -R_PAD],
  ];

  let base =
    '<defs><pattern id="hz" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="var(--rim2)" stroke-width="2"/></pattern></defs>';
  for (let i = 0; i <= VIEW_W; i += 40) base += line(i, 0, i, VIEW_H, 'var(--grid)');
  for (let j = 0; j <= VIEW_H; j += 40) base += line(0, j, VIEW_W, j, 'var(--grid)');

  if (s.tire) base += renderTire(s, R, h, sw, gx, gy);

  base +=
    line(gx(-h) - 40, CY, gx(h) + 40, CY, 'var(--mute)', 1, '10 4 2 4') +
    line(CX, gy(R + FLANGE_H, 1) - 14, CX, gy(R + FLANGE_H, -1) + 14, 'var(--mute)', 1, '10 4 2 4');
  base += `<path d="${path(spoke, 1, true)}" fill="url(#hz)" stroke="var(--ink)" stroke-width="1.6" stroke-linejoin="round"/>`;
  base += line(gx(ET), gy(-R_PAD, 1), gx(ET), gy(R_PAD, 1), ACC, 3.5);
  for (const sg of SIDES) {
    base += `<path d="${path(barrel, sg)}" fill="none" stroke="var(--ink)" stroke-width="${n(6 * scale)}" stroke-linejoin="round" stroke-linecap="round"/>`;
    base += line(gx(xi), gy(R_SPOKE, sg), gx(xi), gy(rw, sg), ACC, 3, '7 4');
  }

  const x0 = gx(-h);
  const x1 = gx(h);
  const mx = gx(ET);
  const xs = gx(xi);
  const yb = gy(rTop, -1) + 36;
  const yt = gy(rTop, 1) - 30;
  base +=
    line(x0, gy(R + FLANGE_H, -1), x0, yb + 30, 'var(--line)', 1, '3 3') +
    line(x1, gy(R + FLANGE_H, -1), x1, yb + 6, 'var(--line)', 1, '3 3') +
    line(mx, gy(R_PAD, -1), mx, yb + 36, 'var(--line)', 1, '3 3');
  base +=
    dim(x0, yb, x1, yb, t('svg.dimWidth', { value: L(s.W) })) +
    dim(x0, yb + 34, mx, yb + 34, t('svg.dimBackspacing', { value: L(backspacing(s.W, ET)) }));
  base +=
    line(mx, gy(R_PAD, 1), mx, yt, 'var(--line)', 1, '3 3') +
    line(xs, gy(R_SPOKE, 1), xs, yt, 'var(--line)', 1, '3 3') +
    dim(mx, yt, xs, yt, t('svg.dimX', { value: M(X) }), true);

  const dx = (s.tire ? Math.min(x0, gx(-s.tw / 2)) : x0) - 46;
  base +=
    line(dx, gy(R, 1), dx, gy(R, -1), 'var(--ink)') +
    line(dx - 6, gy(R, 1), dx + 6, gy(R, 1), 'var(--ink)') +
    line(dx - 6, gy(R, -1), dx + 6, gy(R, -1), 'var(--ink)');
  base += `<text x="${n(dx - 10)}" y="${CY}" font-size="14" text-anchor="middle" transform="rotate(-90 ${n(dx - 10)} ${CY})">${escapeXml(t('svg.dimDiameter', { value: L(s.D) }))}</text>`;
  base += `<text x="${n(mx + (ET >= 0 ? 8 : -8))}" y="${n(gy(R_PAD, 1) - 30)}" font-size="13" text-anchor="${ET >= 0 ? 'start' : 'end'}" style="fill:var(--acct)">${escapeXml(t('svg.dimOffset', { value: signedEt(ET) }))}</text>`;
  base += `<text x="${n(x1 + 10)}" y="${n(gy(R + FLANGE_H, 1) + 4)}" font-size="12" style="fill:var(--mute)">${escapeXml(t('svg.outboard'))}</text>`;
  base += `<text x="${n(x0 - 10)}" y="${n(gy(R + FLANGE_H, 1) + 4)}" font-size="12" text-anchor="end" style="fill:var(--mute)">${escapeXml(t('svg.inboard'))}</text>`;
  // Flange tops are always highlighted as a hint that they can be dragged.
  for (const fx of [x0, x1]) {
    for (const sg of SIDES) base += accent(fx, gy(R + 3, sg), fx, gy(R + FLANGE_H, sg), 3);
  }

  let hits = '';
  for (const sg of SIDES) {
    hits +=
      hitLine('D', gx(-h + 7), gy(R, sg), gx(-h + 24), gy(R, sg), 'ns-resize') +
      hitLine('D', gx(h - 24), gy(R, sg), gx(h - 7), gy(R, sg), 'ns-resize') +
      hitLine('Dw', gx(-h + 40), gy(rw, sg), gx(h - 40), gy(rw, sg), 'ns-resize');
    hits +=
      hitLine('W', x0, gy(R + FLANGE_H, sg), x0, gy(R + 3, sg), 'ew-resize') +
      hitLine('W', x1, gy(R + FLANGE_H, sg), x1, gy(R + 3, sg), 'ew-resize');
    hits += hitLine('X', xs, gy(R_SPOKE, sg), xs, gy(rw, sg), 'ew-resize');
  }
  hits += hitLine('ET', mx, gy(-R_PAD, 1), mx, gy(R_PAD, 1), 'ew-resize');

  let overlay = '';
  switch (view.hot) {
    case 'D':
      for (const sg of SIDES) {
        overlay +=
          accent(gx(-h + 7), gy(R, sg), gx(-h + 24), gy(R, sg), 5) +
          accent(gx(h - 24), gy(R, sg), gx(h - 7), gy(R, sg), 5) +
          accent(gx(-h + 40), gy(rw, sg), gx(h - 40), gy(rw, sg), 5) +
          arrowsV(gx(0), gy(rw, sg));
      }
      overlay += hotLabel(gx(0), gy(rw, 1) + 34, t('svg.hotDiameter', { value: L(s.D) }));
      break;
    case 'W':
      for (const fx of [x0, x1]) {
        for (const sg of SIDES) overlay += accent(fx, gy(R + 3, sg), fx, gy(R + FLANGE_H, sg), 5);
        overlay += arrowsH(fx, gy(R + FLANGE_H / 2, 1));
      }
      overlay += hotLabel(CX, gy(R + FLANGE_H, 1) - 12, t('svg.hotWidth', { value: L(s.W) }));
      break;
    case 'ET':
      overlay +=
        accent(mx, gy(-R_PAD, 1), mx, gy(R_PAD, 1), 6) +
        arrowsH(mx, CY) +
        hotLabel(mx, gy(-R_PAD, 1) + 28, t('svg.hotOffset', { value: signedEt(ET) }));
      break;
    case 'X': {
      for (const sg of SIDES) overlay += accent(xs, gy(R_SPOKE, sg), xs, gy(rw, sg), 5);
      const ym = gy((R_SPOKE + rw) / 2, 1);
      overlay += arrowsH(xs, ym) + hotLabel(xs, ym - 16, t('svg.hotX', { value: M(X) }));
      break;
    }
    case null:
      break;
  }

  return { base, hits, overlay };
}

function renderTire(
  s: Readonly<WheelState>,
  R: number,
  h: number,
  sw: number,
  gx: (x: number) => number,
  gy: (q: number, sg: Side) => number,
): string {
  const P = (x: number, q: number, sg: Side) => `${n(gx(x))},${n(gy(q, sg))}`;
  const a = s.tw / 2;
  const b = a - 0.14 * s.tw;
  const e = Math.min(0.1 * s.tw, 18);
  const hm = FLANGE_H + (sw - FLANGE_H) * 0.5;
  const stretched = isStretched(s.W, s.tw);
  const bad = tireWarning(s.W, s.tw)?.level === 'bad';
  const tread = stretched ? a - e : b;
  let out = '';
  for (const sg of SIDES) {
    // Stretched fit: the tire is narrower than the rim, sidewalls go inward from the flanges.
    const d = stretched
      ? `M${P(-h, R + FLANGE_H, sg)}L${P(-a, R + sw * 0.78, sg)}Q${P(-a, R + sw, sg)} ${P(-a + e, R + sw, sg)}L${P(a - e, R + sw, sg)}Q${P(a, R + sw, sg)} ${P(a, R + sw * 0.78, sg)}L${P(h, R + FLANGE_H, sg)}L${P(h, R, sg)}L${P(-h, R, sg)}Z`
      : `M${P(-h, R + FLANGE_H, sg)}Q${P(-a, R + FLANGE_H, sg)} ${P(-a, R + hm, sg)}Q${P(-a, R + sw, sg)} ${P(-b, R + sw, sg)}L${P(b, R + sw, sg)}Q${P(a, R + sw, sg)} ${P(a, R + hm, sg)}Q${P(a, R + FLANGE_H, sg)} ${P(h, R + FLANGE_H, sg)}L${P(h, R, sg)}L${P(-h, R, sg)}Z`;
    out += `<path d="${d}" fill="var(--tire)" stroke="${bad ? 'var(--bad)' : 'var(--tireE)'}" stroke-width="3" stroke-linejoin="round"/>`;
    out += `<path d="M${P(-tread, R + sw - 9, sg)}L${P(tread, R + sw - 9, sg)}" fill="none" stroke="var(--tireE)" stroke-width="1.5" stroke-dasharray="3 3"/>`;
  }
  return out;
}
