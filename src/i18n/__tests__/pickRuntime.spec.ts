import { describe, expect, it } from 'vitest';
import { RUNTIME_KEYS } from '../constants.ts';
import { DICTS } from '../dictionaries.ts';
import { pickRuntime } from '../utils.ts';

describe('pickRuntime', () => {
  it('keeps exactly the UI keys with the language texts', () => {
    const picked = pickRuntime(DICTS.ru);
    expect(Object.keys(picked).toSorted()).toEqual([...RUNTIME_KEYS].toSorted());
    expect(picked['share.copied']).toBe(DICTS.ru['share.copied']);
  });

  it('landing texts are left out', () => {
    expect(pickRuntime(DICTS.ru)).not.toHaveProperty('faq.1.a');
    expect(pickRuntime(DICTS.ru)).not.toHaveProperty('hero.lead');
  });
});
