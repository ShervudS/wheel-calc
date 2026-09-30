import { NARROW_BAD, NARROW_WARN, STRETCH_BAD, STRETCH_WARN } from './constants.ts';
import type { TireWarning } from './types.ts';

/** Rim width divided by tire width. */
export function rimRatio(W: number, tw: number): number {
  return W / tw;
}

/** Tire narrower than the rim: drawn as a stretched fit. */
export function isStretched(W: number, tw: number): boolean {
  return tw < W;
}

export function tireWarning(W: number, tw: number): TireWarning | null {
  const ratio = rimRatio(W, tw);
  const diff = Math.abs(W - tw);
  if (ratio > STRETCH_BAD) return { level: 'bad', kind: 'stretchBad', ratio, diff };
  if (ratio > STRETCH_WARN) return { level: 'warn', kind: 'stretch', ratio, diff };
  if (ratio < NARROW_BAD) return { level: 'bad', kind: 'narrowBad', ratio, diff };
  if (ratio < NARROW_WARN) return { level: 'warn', kind: 'wide', ratio, diff };
  return null;
}
