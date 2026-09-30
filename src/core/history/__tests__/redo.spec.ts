import { describe, expect, it } from 'vitest';
import { createHistory, record, redo, undo } from '../history.ts';
import { eq, s } from './testState.ts';

describe('redo', () => {
  it('brings undone steps back one by one', () => {
    let h = createHistory(s(0));
    h = record(h, s(1), eq);
    h = record(h, s(2), eq);
    h = undo(undo(h));
    h = redo(h);
    expect(h.present.v).toBe(1);
    h = redo(h);
    expect(h.present.v).toBe(2);
    expect(h.future).toEqual([]);
  });

  it('does nothing on an empty stack', () => {
    const h = createHistory(s(0));
    expect(redo(h)).toBe(h);
  });
});
