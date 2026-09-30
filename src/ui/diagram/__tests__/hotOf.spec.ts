// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { hotOf } from '../geometry.ts';

describe('hotOf', () => {
  it('hotOf: the drop center highlights the diameter', () => {
    expect(hotOf('Dw')).toBe('D');
    expect(hotOf('ET')).toBe('ET');
  });
});
