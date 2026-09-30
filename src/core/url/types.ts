import type { WheelState } from '../types/wheelState.ts';
import type { Unit } from '../units/types.ts';

export interface UrlState {
  state: WheelState;
  unit: Unit;
}
