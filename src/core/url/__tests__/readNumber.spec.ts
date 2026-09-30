import { describe, expect, it } from 'vitest';
import { readNumber } from '../utils.ts';

describe('readNumber', () => {
  const q = new URLSearchParams('a=12.5&b=&c=abc&d=Infinity&e=%20&f=-3');

  it('reads finite numbers', () => {
    expect(readNumber(q, 'a')).toBe(12.5);
    expect(readNumber(q, 'f')).toBe(-3);
  });

  it('empty, missing, garbage and infinite give null', () => {
    for (const k of ['b', 'c', 'd', 'e', 'missing']) expect(readNumber(q, k), k).toBeNull();
  });
});
