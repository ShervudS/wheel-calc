import { describe, expect, it } from 'vitest';
import { parseUnit } from '../utils.ts';

describe('parseUnit', () => {
  it('in means inches, anything else millimetres', () => {
    expect(parseUnit('in')).toBe('in');
    expect(parseUnit('mm')).toBe('mm');
    expect(parseUnit('IN')).toBe('mm');
    expect(parseUnit(null)).toBe('mm');
  });
});
