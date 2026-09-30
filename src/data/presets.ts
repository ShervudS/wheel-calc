import type { WheelState } from '../core/types/wheelState.ts';
import { inches } from '../core/units/utils.ts';

export interface Preset {
  /** Diameter, inches. */
  d: number;
  /** Width, inches. */
  w: number;
  /** ET offset, mm. */
  et: number;
  /** Tire width, mm. */
  tw: number;
  /** Tire aspect ratio, %. */
  ta: number;
}

export type PresetGroupKey =
  | 'preset.group.factory'
  | 'preset.group.aftermarket'
  | 'preset.group.stretch';

export interface PresetGroup {
  key: PresetGroupKey;
  items: readonly Preset[];
}

const p = (d: number, w: number, et: number, tw: number, ta: number): Preset => ({
  d,
  w,
  et,
  tw,
  ta,
});

/** Typical references, not data for specific cars. */
export const PRESET_GROUPS: readonly PresetGroup[] = [
  {
    key: 'preset.group.factory',
    items: [
      p(15, 6, 45, 195, 65),
      p(16, 6.5, 40, 205, 55),
      p(17, 7, 45, 225, 45),
      p(18, 8, 45, 235, 40),
      p(19, 8.5, 40, 235, 40),
    ],
  },
  {
    key: 'preset.group.aftermarket',
    items: [
      p(17, 8.5, 35, 235, 40),
      p(18, 9, 30, 245, 40),
      p(18, 9.5, 22, 255, 35),
      p(18, 10, 12, 265, 35),
      p(19, 9.5, 35, 265, 30),
    ],
  },
  {
    key: 'preset.group.stretch',
    items: [p(17, 9, 25, 215, 40), p(17, 9, 22, 205, 40)],
  },
];

export const ALL_PRESETS: readonly Preset[] = PRESET_GROUPS.flatMap((g) => g.items);

/** Applies a preset: changes diameter, width, offset and tire; keeps X-factor and tire visibility. */
export function applyPreset(s: Readonly<WheelState>, preset: Preset): WheelState {
  return {
    ...s,
    D: inches(preset.d),
    W: inches(preset.w),
    ET: preset.et,
    tw: preset.tw,
    ta: preset.ta,
  };
}
