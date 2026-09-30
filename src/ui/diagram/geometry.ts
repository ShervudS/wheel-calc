import { sidewall } from '../../core/tire/size.ts';
import type { WheelState } from '../../core/types/wheelState.ts';
import { WHEEL_LIMITS } from '../../core/wheel/constants.ts';
import type { HotKey } from '../types/hotKey.ts';
import { BASE_SCALE, CX, CY, HALF_INCH, WELL_DEPTH } from './constants.ts';
import type { DragKey, Projection } from './types.ts';

/**
 * Diagram scale. With a tire the canvas shrinks so the tallest tire fits on the
 * smallest diameter. As in the prototype, it uses 12″, not the current diameter.
 */
export function diagramScale(s: Readonly<WheelState>): number {
  if (!s.tire) return BASE_SCALE;
  return Math.min(BASE_SCALE, 225 / (WHEEL_LIMITS.D[0] + sidewall(s.tw, s.ta)));
}

export function projection(scale: number): Projection {
  return {
    scale,
    gx: (x) => CX + x * scale,
    gy: (q, sg) => CY - sg * q * scale,
  };
}

export function hotOf(k: DragKey): HotKey {
  return k === 'Dw' ? 'D' : k;
}

const snapHalfInch = (mm: number) => Math.round(mm / HALF_INCH) * HALF_INCH;

/** New parameter value for a pointer position in viewBox coordinates. */
export function dragValue(
  key: DragKey,
  p: { x: number; y: number },
  s: Readonly<WheelState>,
  scale: number,
): Partial<WheelState> {
  const dx = (p.x - CX) / scale;
  const dy = Math.abs(p.y - CY) / scale;
  switch (key) {
    case 'D':
      return { D: snapHalfInch(2 * dy) };
    case 'Dw':
      return { D: snapHalfInch(2 * (dy + WELL_DEPTH)) };
    case 'W':
      return { W: snapHalfInch(2 * Math.abs(dx)) };
    case 'X':
      return { X: Math.round(dx - s.ET) };
    case 'ET':
      return { ET: Math.round(dx) };
  }
}
