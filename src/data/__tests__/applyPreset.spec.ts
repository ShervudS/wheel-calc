import { describe, expect, it } from 'vitest';
import { inches } from '../../core/units/utils.ts';
import { ALL_PRESETS, applyPreset } from '../presets.ts';
import { DEFAULT_STATE } from '../../core/wheel/constants.ts';

describe('applyPreset', () => {
  it('a preset keeps X-factor and tire visibility', () => {
    const base = { ...DEFAULT_STATE, X: 12, tire: true };
    const preset = ALL_PRESETS[3];
    if (!preset) throw new Error('preset 3 missing');
    const s = applyPreset(base, preset);
    expect(s).toEqual({ ...base, D: inches(18), W: inches(8), ET: 45, tw: 235, ta: 40 });
  });
});
