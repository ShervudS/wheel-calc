import { describe, expect, it } from 'vitest';
import { canUndo, createHistory, record, undo } from '../history.ts';
import { eq, s } from './testState.ts';

describe('canUndo', () => {
  it('whether there are steps back', () => {
    let h = createHistory(s(0));
    expect(canUndo(h)).toBe(false);
    h = record(h, s(1), eq);
    expect(canUndo(h)).toBe(true);
    h = undo(h);
    expect(canUndo(h)).toBe(false);
  });
});
