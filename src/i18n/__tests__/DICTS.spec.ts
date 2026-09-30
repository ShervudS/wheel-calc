import { describe, expect, it } from 'vitest';
import en from '../en.json' with { type: 'json' };
import ru from '../ru.json' with { type: 'json' };
import { DICTS } from '../dictionaries.ts';
import { placeholders } from '../utils.ts';

const CYRILLIC = /[Ѐ-ӿ]/;

describe('language parity', () => {
  it('same set of keys', () => {
    expect(Object.keys(en).toSorted()).toEqual(Object.keys(ru).toSorted());
  });

  it.each(['ru', 'en'] as const)('%s: values are not empty', (lang) => {
    for (const [k, v] of Object.entries(DICTS[lang])) {
      expect(v.trim(), `${lang}:${k}`).not.toBe('');
    }
  });

  it('no Cyrillic in English', () => {
    for (const [k, v] of Object.entries(en)) expect(CYRILLIC.test(v), k).toBe(false);
  });

  it('placeholders match', () => {
    for (const k of Object.keys(ru) as (keyof typeof ru)[]) {
      expect(placeholders(en[k]), k).toEqual(placeholders(ru[k]));
    }
  });

  it('markup only in keys with the _html suffix', () => {
    const withMarkup = (['ru', 'en'] as const).flatMap((lang) =>
      Object.entries(DICTS[lang])
        .filter(([k, v]) => !k.endsWith('_html') && /<[a-z/]/i.test(v))
        .map(([k]) => `${lang}:${k}`),
    );
    expect(withMarkup).toEqual([]);
  });
});
