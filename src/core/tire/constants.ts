import type { Range } from '../types/range.ts';

export const TIRE_LIMITS = {
  /** Tire width, mm. */
  tw: [125, 405],
  /** Aspect ratio, %. */
  ta: [20, 90],
} as const satisfies Record<string, Range>;

export const DEFAULT_TIRE = { tw: 245, ta: 40 } as const;

/** Thresholds for the rim-to-tire width ratio (sr = W / tw). */
export const STRETCH_BAD = 1.12;
export const STRETCH_WARN = 1;
export const NARROW_BAD = 0.6;
export const NARROW_WARN = 0.68;
