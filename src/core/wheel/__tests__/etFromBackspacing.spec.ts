import { describe, expect, it } from 'vitest';
import { inches } from '../../units/utils.ts';
import { etFromBackspacing } from '../geometry.ts';

describe('etFromBackspacing', () => {
  it('reverse calculation gives the offset', () => {
    expect(etFromBackspacing(136.6, inches(8))).toBeCloseTo(35, 10);
  });
});
