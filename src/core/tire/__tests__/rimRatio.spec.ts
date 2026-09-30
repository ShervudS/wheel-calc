import { describe, expect, it } from 'vitest';
import { rimRatio } from '../fit.ts';
import { INCH } from '../../units/constants.ts';

describe('rimRatio', () => {
  it('ratio sr = W / tw', () => {
    expect(rimRatio(8 * INCH, 245)).toBeCloseTo(203.2 / 245, 10);
  });
});
