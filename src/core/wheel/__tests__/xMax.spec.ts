import { describe, expect, it } from 'vitest';
import { inches } from '../../units/utils.ts';
import { xMax } from '../geometry.ts';

describe('xMax', () => {
  it('maximum = W/2 − ET − 14 − 8', () => {
    expect(xMax(inches(8), 35)).toBeCloseTo(101.6 - 35 - 22, 10);
    expect(xMax(inches(10), 12)).toBeCloseTo(127 - 12 - 22, 10);
  });

  it('the maximum is never negative', () => {
    expect(xMax(inches(4), 120)).toBe(0);
  });

  it('the maximum grows with width and falls with offset', () => {
    expect(xMax(inches(9), 35)).toBeGreaterThan(xMax(inches(8), 35));
    expect(xMax(inches(8), 45)).toBeLessThan(xMax(inches(8), 35));
  });
});
