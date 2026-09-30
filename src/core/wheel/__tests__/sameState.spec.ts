import { describe, expect, it } from 'vitest';
import type { WheelState } from '../../types/wheelState.ts';
import { sameState } from '../compare.ts';
import { DEFAULT_STATE } from '../constants.ts';

const state = (patch: Partial<WheelState> = {}): WheelState => ({ ...DEFAULT_STATE, ...patch });

describe('sameState', () => {
  it('compares all fields', () => {
    expect(sameState(state(), state())).toBe(true);
    expect(sameState(state(), state({ tire: true }))).toBe(false);
    expect(sameState(state(), state({ ta: 45 }))).toBe(false);
  });
});
