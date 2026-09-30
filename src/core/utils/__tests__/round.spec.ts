import { describe, expect, it } from 'vitest';
import { round } from '../round.ts';

describe('round', () => {
  it('round rounds to digits', () => {
    expect(round(1.2345, 2)).toBe(1.23);
    expect(round(1.25, 1)).toBe(1.3);
    expect(round(7.6, 0)).toBe(8);
  });
});
