import { describe, expect, it } from 'vitest';
import { canRedo, createHistory, record, redo, undo } from '../history.ts';
import { eq, s } from './testState.ts';

describe('canRedo', () => {
  it('whether there are undone steps', () => {
    let h = createHistory(s(0));
    expect(canRedo(h)).toBe(false);
    h = undo(record(h, s(1), eq));
    expect(canRedo(h)).toBe(true);
    h = redo(h);
    expect(canRedo(h)).toBe(false);
  });
});
