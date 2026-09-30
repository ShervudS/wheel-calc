import { describe, expect, it } from 'vitest';
import { canRedo, canUndo, createHistory } from '../history.ts';
import { s } from './testState.ts';

describe('createHistory', () => {
  it('initial state has no steps', () => {
    const h = createHistory(s(0));
    expect(h.present).toEqual(s(0));
    expect(canUndo(h)).toBe(false);
    expect(canRedo(h)).toBe(false);
  });
});
