import { describe, expect, it } from 'vitest';
import { interpolate } from '../utils.ts';

describe('interpolate', () => {
  it('fills in parameters', () => {
    expect(interpolate('{a} and {b}', { a: 1, b: 'two' })).toBe('1 and two');
  });

  it('an unknown placeholder is left as is', () => {
    expect(interpolate('{a} {b}', { a: 1 })).toBe('1 {b}');
    expect(interpolate('{a}')).toBe('{a}');
  });
});
