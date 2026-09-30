import { describe, expect, it } from 'vitest';
import { RUNTIME_KEYS } from '../constants.ts';
import { DICTS } from '../dictionaries.ts';

describe('RUNTIME_KEYS', () => {
  it('no duplicates', () => {
    expect(new Set(RUNTIME_KEYS).size).toBe(RUNTIME_KEYS.length);
  });

  it('every key exists in both dictionaries', () => {
    for (const lang of ['ru', 'en'] as const) {
      const missing = RUNTIME_KEYS.filter((k) => !Object.hasOwn(DICTS[lang], k));
      expect(missing, lang).toEqual([]);
    }
  });

  it('a small part of the dictionary: landing texts stay out of the browser', () => {
    expect(RUNTIME_KEYS.length).toBeLessThan(Object.keys(DICTS.ru).length / 2);
  });
});
