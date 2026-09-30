import { describe, expect, it } from 'vitest';
import type { WheelState } from '../../types/wheelState.ts';
import { inches } from '../../units/utils.ts';
import { nudge } from '../nudge.ts';
import { DEFAULT_STATE } from '../constants.ts';

const state = (patch: Partial<WheelState> = {}): WheelState => ({ ...DEFAULT_STATE, ...patch });

describe('nudge: keyboard step', () => {
  it('diameter and width: half an inch, an inch with Shift', () => {
    expect(nudge(state(), 'D', 1, false).D).toBeCloseTo(inches(17.5), 10);
    expect(nudge(state(), 'D', -1, true).D).toBeCloseTo(inches(16), 10);
    expect(nudge(state(), 'W', 1, true).W).toBeCloseTo(inches(9), 10);
  });

  it('offset and X: 1 mm, 5 mm with Shift', () => {
    expect(nudge(state(), 'ET', 1, false).ET).toBe(36);
    expect(nudge(state(), 'ET', -1, true).ET).toBe(30);
    expect(nudge(state(), 'X', -1, true).X).toBe(35);
  });

  it('does not mutate the input state', () => {
    const s = state();
    nudge(s, 'ET', 1, false);
    expect(s.ET).toBe(35);
  });
});
