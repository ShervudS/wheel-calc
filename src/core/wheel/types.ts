import type { WheelState } from '../types/wheelState.ts';

export interface Constrained {
  state: WheelState;
  /** Max X for the resulting width and offset. */
  xMax: number;
  /** X exceeded the maximum and was clamped. */
  xLimited: boolean;
}

export type EditableParam = 'D' | 'W' | 'ET' | 'X';
