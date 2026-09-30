import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ICON_IDS, SPRITE_SRC } from '../constants.ts';

const sprite = readFileSync(`.${SPRITE_SRC}`, 'utf8');
const symbolIds = [...sprite.matchAll(/<symbol\s+id="([\w-]+)"/g)].map((m) => m[1]);

describe('ICON_IDS', () => {
  it('matches the set of <symbol> in the sprite', () => {
    expect(symbolIds.toSorted()).toEqual([...ICON_IDS].toSorted());
  });

  it('sprite ids are unique', () => {
    expect(new Set(symbolIds).size).toBe(symbolIds.length);
  });

  it('every icon has a viewBox and a currentColor stroke', () => {
    for (const m of sprite.matchAll(/<symbol\s[^>]*>/g)) {
      expect(m[0]).toContain('viewBox="0 0 24 24"');
      expect(m[0]).toContain('stroke="currentColor"');
    }
  });
});
