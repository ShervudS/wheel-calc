import { describe, expect, it } from 'vitest';
import { placeholders } from '../utils.ts';

describe('placeholders', () => {
  it('names in alphabetical order', () => {
    expect(placeholders('{tw}/{ta} {d}')).toEqual(['d', 'ta', 'tw']);
    expect(placeholders('no params')).toEqual([]);
  });
});
