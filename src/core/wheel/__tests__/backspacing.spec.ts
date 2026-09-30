import { describe, expect, it } from 'vitest';
import { inches } from '../../units/utils.ts';
import { backspacing } from '../geometry.ts';

describe('backspacing', () => {
  it('B = W/2 + ET', () => {
    expect(backspacing(inches(8), 35)).toBeCloseTo(136.6, 10);
    expect(backspacing(inches(8), -20)).toBeCloseTo(81.6, 10);
  });
});
