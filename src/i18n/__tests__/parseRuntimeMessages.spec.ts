import { describe, expect, it } from 'vitest';
import { DICTS } from '../dictionaries.ts';
import { parseRuntimeMessages, pickRuntime } from '../utils.ts';

describe('parseRuntimeMessages', () => {
  it('reads UI keys from JSON and drops extras', () => {
    const raw = JSON.stringify({ ...pickRuntime(DICTS.ru), extra: 'x' });
    const parsed = parseRuntimeMessages(raw);
    expect(parsed).toEqual(pickRuntime(DICTS.ru));
    expect(parsed).not.toHaveProperty('extra');
  });

  it('missing or non-string key: error naming the keys', () => {
    const { 'share.copied': _, ...rest } = pickRuntime(DICTS.ru);
    expect(() => parseRuntimeMessages(JSON.stringify(rest))).toThrow(/share\.copied/);
    expect(() =>
      parseRuntimeMessages(JSON.stringify({ ...pickRuntime(DICTS.ru), 'kb.D': 1 })),
    ).toThrow(/kb\.D/);
  });

  it('not an object or broken JSON: error', () => {
    expect(() => parseRuntimeMessages('null')).toThrow(/object/);
    expect(() => parseRuntimeMessages('"text"')).toThrow(/object/);
    expect(() => parseRuntimeMessages('{')).toThrow(SyntaxError);
  });
});
