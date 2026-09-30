import { describe, expect, it } from 'vitest';
import { structuralEquals } from '../utils.ts';

describe('structuralEquals', () => {
  it('compares contents, not references', () => {
    expect(structuralEquals({ a: 1, b: [2] }, { a: 1, b: [2] })).toBe(true);
    expect(structuralEquals({ a: 1 }, { a: 2 })).toBe(false);
  });
});
