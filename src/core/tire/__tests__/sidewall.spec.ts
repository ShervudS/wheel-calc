import { describe, expect, it } from 'vitest';
import { sidewall } from '../size.ts';

describe('sidewall', () => {
  it('sidewall = tw × ta / 100', () => {
    expect(sidewall(245, 40)).toBe(98);
    expect(sidewall(195, 65)).toBeCloseTo(126.75, 10);
  });
});
