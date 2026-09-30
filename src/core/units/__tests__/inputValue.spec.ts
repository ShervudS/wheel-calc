import { describe, expect, it } from 'vitest';
import { inputValue } from '../convert.ts';

describe('inputValue', () => {
  it('field value: mm to tenths, inches to hundredths', () => {
    expect(inputValue(431.8, 'mm')).toBe(431.8);
    expect(inputValue(136.64, 'mm')).toBe(136.6);
    expect(inputValue(431.8, 'in')).toBe(17);
    expect(inputValue(136.6, 'in')).toBe(5.38);
  });
});
