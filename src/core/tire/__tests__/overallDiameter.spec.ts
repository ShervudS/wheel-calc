import { describe, expect, it } from 'vitest';
import { overallDiameter } from '../size.ts';
import { INCH } from '../../units/constants.ts';

describe('overallDiameter', () => {
  it('245/40 on 17″: overall diameter 627.8 mm', () => {
    expect(overallDiameter(17 * INCH, 245, 40)).toBeCloseTo(627.8, 10);
  });
});
