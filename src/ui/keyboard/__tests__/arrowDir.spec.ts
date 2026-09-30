// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { arrowDir } from '../utils.ts';

describe('arrowDir', () => {
  it('arrowDir', () => {
    expect(arrowDir('ArrowUp')).toBe(1);
    expect(arrowDir('ArrowRight')).toBe(1);
    expect(arrowDir('ArrowDown')).toBe(-1);
    expect(arrowDir('ArrowLeft')).toBe(-1);
    expect(arrowDir('a')).toBe(0);
  });
});
