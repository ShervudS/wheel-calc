import { describe, expect, it } from 'vitest';
import type { WheelState } from '../../types/wheelState.ts';
import { inches } from '../../units/utils.ts';
import { DEFAULT_STATE } from '../constants.ts';
import { constrain } from '../constrain.ts';
import { xMax } from '../geometry.ts';

const state = (patch: Partial<WheelState> = {}): WheelState => ({ ...DEFAULT_STATE, ...patch });

describe('defaults', () => {
  it('pass their own constraints without clamping', () => {
    const r = constrain(DEFAULT_STATE);
    expect(r.state).toEqual(DEFAULT_STATE);
    expect(r.xLimited).toBe(false);
  });

  it('17″, 8″, ET 35, X 40, tire 245/40', () => {
    expect(DEFAULT_STATE).toEqual({
      D: inches(17),
      W: inches(8),
      ET: 35,
      X: 40,
      tire: false,
      tw: 245,
      ta: 40,
    });
  });

  it('default X is not above the maximum (the prototype had a bug with X = 45)', () => {
    expect(DEFAULT_STATE.X).toBeLessThanOrEqual(xMax(DEFAULT_STATE.W, DEFAULT_STATE.ET));
    expect(constrain(state({ X: 45 })).xLimited).toBe(true);
  });
});
