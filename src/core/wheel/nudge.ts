import type { WheelState } from '../types/wheelState.ts';
import { INCH } from '../units/constants.ts';
import type { EditableParam } from './types.ts';

/** Keyboard step: diameter and width by half an inch (Shift: an inch), ET and X by 1 mm (Shift: 5 mm). */
export function nudge(
  s: Readonly<WheelState>,
  key: EditableParam,
  dir: 1 | -1,
  big: boolean,
): WheelState {
  const step = key === 'D' || key === 'W' ? (INCH / 2) * (big ? 2 : 1) : big ? 5 : 1;
  return { ...s, [key]: s[key] + dir * step };
}
