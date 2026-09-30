import { describe, expect, it } from 'vitest';
import type { WheelState } from '../../types/wheelState.ts';
import { inches } from '../../units/utils.ts';
import { fromQuery, toQuery } from '../urlState.ts';
import { DEFAULT_STATE } from '../../wheel/constants.ts';

const state = (patch: Partial<WheelState> = {}): WheelState => ({ ...DEFAULT_STATE, ...patch });

describe('fromQuery', () => {
  it('state and query round trip', () => {
    const cases: [WheelState, 'mm' | 'in'][] = [
      [state(), 'mm'],
      [state({ D: inches(18), W: inches(9.5), ET: 22, X: 30, tire: true, tw: 255, ta: 35 }), 'in'],
      [state({ D: inches(12), W: inches(14), ET: -100, X: 0 }), 'mm'],
    ];
    for (const [s, u] of cases) {
      const r = fromQuery('?' + toQuery(s, u));
      expect(r.unit).toBe(u);
      expect(r.state).toEqual(s);
    }
  });

  it('a link with default parameters gives exactly the default state', () => {
    expect(fromQuery('?' + toQuery(DEFAULT_STATE, 'mm')).state).toEqual(DEFAULT_STATE);
  });

  it('empty query: defaults', () => {
    expect(fromQuery('')).toEqual({ state: DEFAULT_STATE, unit: 'mm' });
    expect(fromQuery('?')).toEqual({ state: DEFAULT_STATE, unit: 'mm' });
  });

  it('garbage values are ignored', () => {
    const r = fromQuery('?d=abc&w=&et=NaN&x=Infinity&u=furlong&t=yes&tw=1e&ta=--');
    expect(r).toEqual({ state: DEFAULT_STATE, unit: 'mm' });
  });

  it('out-of-range values are clamped', () => {
    const r = fromQuery('?d=10000&w=1&et=-999&x=-5&t=1&tw=9999&ta=1');
    expect(r.state).toMatchObject({
      D: inches(24),
      W: inches(4),
      ET: -100,
      X: 0,
      tire: true,
      tw: 405,
      ta: 20,
    });
  });

  it('X is clamped to the max for the width and offset from the link', () => {
    const r = fromQuery('?w=203.2&et=35&x=90');
    expect(r.state.X).toBeCloseTo(44.6, 10);
  });

  it('a partial query is filled with defaults', () => {
    const r = fromQuery('?et=20&u=in');
    expect(r.unit).toBe('in');
    expect(r.state).toEqual(state({ ET: 20 }));
  });

  it('accepts a string without "?" and a different fallback state', () => {
    const base = state({ ET: 10 });
    expect(fromQuery('x=5', base).state).toEqual(state({ ET: 10, X: 5 }));
  });

  it('the tire is enabled only by t=1', () => {
    expect(fromQuery('?t=0').state.tire).toBe(false);
    expect(fromQuery('?t=1').state.tire).toBe(true);
  });
});
