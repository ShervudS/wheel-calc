import { describe, expect, it } from 'vitest';
import type { WheelState } from '../../types/wheelState.ts';
import { TIRE_LIMITS } from '../../tire/constants.ts';
import { inches } from '../../units/utils.ts';
import { sameState } from '../compare.ts';
import { DEFAULT_STATE } from '../constants.ts';
import { constrain } from '../constrain.ts';
import { xMax } from '../geometry.ts';

const state = (patch: Partial<WheelState> = {}): WheelState => ({ ...DEFAULT_STATE, ...patch });

describe('limits', () => {
  it('diameter 12–24″', () => {
    expect(constrain(state({ D: inches(5) })).state.D).toBe(inches(12));
    expect(constrain(state({ D: inches(30) })).state.D).toBe(inches(24));
    expect(constrain(state({ D: inches(12) })).state.D).toBe(inches(12));
    expect(constrain(state({ D: inches(24) })).state.D).toBe(inches(24));
  });

  it('width 4–14″', () => {
    expect(constrain(state({ W: inches(3) })).state.W).toBe(inches(4));
    expect(constrain(state({ W: inches(15) })).state.W).toBe(inches(14));
  });

  it('offset −100…120 mm', () => {
    expect(constrain(state({ ET: -150 })).state.ET).toBe(-100);
    expect(constrain(state({ ET: 150 })).state.ET).toBe(120);
    expect(constrain(state({ ET: -100 })).state.ET).toBe(-100);
    expect(constrain(state({ ET: 120 })).state.ET).toBe(120);
  });

  it('tire: width 125–405, aspect ratio 20–90', () => {
    const r = constrain(state({ tw: 100, ta: 99 })).state;
    expect(r.tw).toBe(TIRE_LIMITS.tw[0]);
    expect(r.ta).toBe(TIRE_LIMITS.ta[1]);
    const r2 = constrain(state({ tw: 500, ta: 5 })).state;
    expect(r2.tw).toBe(TIRE_LIMITS.tw[1]);
    expect(r2.ta).toBe(TIRE_LIMITS.ta[0]);
  });

  it('normalizes lengths to thousandths of a mm, removing float noise', () => {
    const r = constrain(state({ D: 17 * 25.4, W: 8 * 25.4, ET: 35.00000001 })).state;
    expect(r.D).toBe(431.8);
    expect(r.W).toBe(203.2);
    expect(r.ET).toBe(35);
    expect(sameState(r, DEFAULT_STATE)).toBe(true);
  });

  it('does not mutate the input state', () => {
    const s = state({ D: 1 });
    constrain(s);
    expect(s.D).toBe(1);
  });
});

describe('constrain: X-factor', () => {
  it('above the maximum: clamped and flagged', () => {
    const r = constrain(state({ X: 60 }));
    expect(r.state.X).toBeCloseTo(44.6, 10);
    expect(r.xMax).toBeCloseTo(44.6, 10);
    expect(r.xLimited).toBe(true);
  });

  it('exactly the maximum and within the 0.05 mm tolerance: not flagged', () => {
    const m = xMax(DEFAULT_STATE.W, DEFAULT_STATE.ET);
    expect(constrain(state({ X: m })).xLimited).toBe(false);
    expect(constrain(state({ X: m + 0.05 })).xLimited).toBe(false);
    expect(constrain(state({ X: m + 0.06 })).xLimited).toBe(true);
  });

  it('negative X is raised to 0 without a flag', () => {
    const r = constrain(state({ X: -5 }));
    expect(r.state.X).toBe(0);
    expect(r.xLimited).toBe(false);
  });

  it('the maximum is computed after clamping width and offset', () => {
    const r = constrain(state({ W: inches(20), ET: 200, X: 500 }));
    expect(r.xMax).toBeCloseTo(xMax(inches(14), 120), 10);
  });
});
