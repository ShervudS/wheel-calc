import type { WheelState } from '../types/wheelState.ts';
import { clamp } from '../utils/clamp.ts';
import { TIRE_LIMITS } from '../tire/constants.ts';
import { normalizeMm } from '../units/utils.ts';
import { WHEEL_LIMITS, X_LIMIT_TOLERANCE } from './constants.ts';
import { xMax } from './geometry.ts';
import type { Constrained } from './types.ts';

/**
 * Clamps the state to valid limits and normalizes lengths to thousandths of a mm.
 * The input object is not mutated.
 */
export function constrain(s: Readonly<WheelState>): Constrained {
  const D = normalizeMm(clamp(s.D, ...WHEEL_LIMITS.D));
  const W = normalizeMm(clamp(s.W, ...WHEEL_LIMITS.W));
  const ET = normalizeMm(clamp(s.ET, ...WHEEL_LIMITS.ET));
  const max = normalizeMm(xMax(W, ET));
  return {
    state: {
      D,
      W,
      ET,
      X: normalizeMm(clamp(s.X, 0, max)),
      tire: s.tire,
      tw: clamp(s.tw, ...TIRE_LIMITS.tw),
      ta: clamp(s.ta, ...TIRE_LIMITS.ta),
    },
    xMax: max,
    xLimited: s.X > max + X_LIMIT_TOLERANCE,
  };
}
