import { describe, expect, it } from 'vitest';
import { normalizeMm } from '../utils.ts';

describe('normalizeMm', () => {
  it('normalizeMm keeps thousandths of a millimetre', () => {
    expect(normalizeMm(17 * 25.4)).toBe(431.8);
    expect(normalizeMm(1.23456)).toBe(1.235);
  });
});
