import { describe, expect, it } from 'vitest';
import type { WheelState } from '../../types/wheelState.ts';
import { toQuery } from '../urlState.ts';
import { DEFAULT_STATE } from '../../wheel/constants.ts';

const state = (patch: Partial<WheelState> = {}): WheelState => ({ ...DEFAULT_STATE, ...patch });

describe('toQuery', () => {
  it('writes d, w, et, x, u; the tire only when it is shown', () => {
    expect(toQuery(state(), 'mm')).toBe('d=431.8&w=203.2&et=35&x=40&u=mm');
    expect(toQuery(state({ tire: true, tw: 225, ta: 45 }), 'in')).toBe(
      'd=431.8&w=203.2&et=35&x=40&u=in&t=1&tw=225&ta=45',
    );
  });

  it('rounds to tenths, the tire to integers', () => {
    expect(toQuery(state({ ET: 35.26, X: 10.04, tire: true, tw: 244.6, ta: 39.4 }), 'mm')).toBe(
      'd=431.8&w=203.2&et=35.3&x=10&u=mm&t=1&tw=245&ta=39',
    );
  });
});
