import { describe, expect, it } from 'vitest';
import { INCH } from '../constants.ts';
import { toUnit } from '../convert.ts';

describe('toUnit', () => {
  it('an inch = 25.4 mm', () => {
    expect(INCH).toBe(25.4);
    expect(toUnit(25.4, 'in')).toBe(1);
    expect(toUnit(431.8, 'in')).toBeCloseTo(17, 10);
  });

  it('millimetres stay unchanged', () => {
    expect(toUnit(431.8, 'mm')).toBe(431.8);
  });
});
