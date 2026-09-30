import type { Range } from '../types/range.ts';
import type { WheelState } from '../types/wheelState.ts';
import { DEFAULT_TIRE } from '../tire/constants.ts';
import { inches } from '../units/utils.ts';

/** Spoke thickness on the diagram, mm. */
export const SPOKE_THICKNESS = 14;
/** Clearance between the spokes and the rim flange when computing max X, mm. */
export const X_MARGIN = 8;
/** Tolerance above which X counts as clamped, mm. */
export const X_LIMIT_TOLERANCE = 0.05;

export const WHEEL_LIMITS = {
  D: [inches(12), inches(24)],
  W: [inches(4), inches(14)],
  ET: [-100, 120],
} as const satisfies Record<string, Range>;

export const DEFAULT_STATE: Readonly<WheelState> = Object.freeze({
  D: inches(17),
  W: inches(8),
  ET: 35,
  X: 40,
  tire: false,
  ...DEFAULT_TIRE,
});
