import { describe, expect, it } from 'vitest';
import { inches } from '../utils.ts';

describe('inches', () => {
  it('inches gives normalized mm', () => {
    expect(inches(17)).toBe(431.8);
    expect(inches(24)).toBe(609.6);
    expect(inches(9.5)).toBe(241.3);
  });
});
