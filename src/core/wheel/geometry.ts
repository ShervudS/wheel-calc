import { SPOKE_THICKNESS, X_MARGIN } from './constants.ts';

/** Largest X-factor at which the spokes still fit inside the rim. */
export function xMax(W: number, ET: number): number {
  return Math.max(0, W / 2 - ET - SPOKE_THICKNESS - X_MARGIN);
}

/** Backspacing: from the mounting face to the inner rim edge. */
export function backspacing(W: number, ET: number): number {
  return W / 2 + ET;
}

export function etFromBackspacing(B: number, W: number): number {
  return B - W / 2;
}
