import type { WheelState } from '../types/wheelState.ts';

export function sameState(a: Readonly<WheelState>, b: Readonly<WheelState>): boolean {
  return (
    a.D === b.D &&
    a.W === b.W &&
    a.ET === b.ET &&
    a.X === b.X &&
    a.tire === b.tire &&
    a.tw === b.tw &&
    a.ta === b.ta
  );
}
