import { describe, expect, it } from 'vitest';
import { isLang } from '../utils.ts';

describe('isLang', () => {
  it('accepts only supported languages', () => {
    expect(isLang('ru')).toBe(true);
    expect(isLang('en')).toBe(true);
    expect(isLang('de')).toBe(false);
    expect(isLang(undefined)).toBe(false);
  });
});
