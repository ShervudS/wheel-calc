import { describe, expect, it } from 'vitest';
import { fromUnit, toUnit } from '../convert.ts';

describe('fromUnit', () => {
  it('inches to millimetres', () => {
    expect(fromUnit(1, 'in')).toBe(25.4);
  });

  it('millimetres stay unchanged', () => {
    expect(fromUnit(431.8, 'mm')).toBe(431.8);
  });

  it('inverse of toUnit: lossless round trip', () => {
    for (const mm of [304.8, 431.8, 203.2, 136.6, 609.6, 0, 1]) {
      expect(fromUnit(toUnit(mm, 'in'), 'in')).toBeCloseTo(mm, 10);
      expect(fromUnit(toUnit(mm, 'mm'), 'mm')).toBe(mm);
    }
  });
});
