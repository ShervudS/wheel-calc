import { describe, expect, it } from 'vitest';
import { isStretched } from '../fit.ts';
import { INCH } from '../../units/constants.ts';

describe('isStretched', () => {
  it('stretched when the tire is narrower than the rim', () => {
    expect(isStretched(9 * INCH, 215)).toBe(true);
    expect(isStretched(8 * INCH, 245)).toBe(false);
    expect(isStretched(200, 200)).toBe(false);
  });
});
