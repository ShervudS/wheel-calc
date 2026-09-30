import { describe, expect, it } from 'vitest';
import { isIconId } from '../utils.ts';

describe('isIconId', () => {
  it('accepts only sprite ids', () => {
    expect(isIconId('undo')).toBe(true);
    expect(isIconId('arrow-down')).toBe(true);
    expect(isIconId('nope')).toBe(false);
    expect(isIconId(undefined)).toBe(false);
  });
});
