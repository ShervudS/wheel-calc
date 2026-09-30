import { describe, expect, it } from 'vitest';
import { DICTS } from '../dictionaries.ts';
import { createTranslator } from '../translate.ts';
import { pickRuntime } from '../utils.ts';

describe('createTranslator', () => {
  it('translates from the given UI keys and fills in parameters', () => {
    const t = createTranslator(pickRuntime(DICTS.en));
    expect(t('x.hintMax', { value: 44.6 })).toBe('Maximum at this width and offset — 44.6 mm');
    expect(t('share.copied')).toBe('Link copied');
  });
});
