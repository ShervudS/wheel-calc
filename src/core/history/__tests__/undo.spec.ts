import { describe, expect, it } from 'vitest';
import { createHistory, record, undo } from '../history.ts';
import { eq, s } from './testState.ts';

describe('undo', () => {
  it('goes back to previous steps one by one', () => {
    let h = createHistory(s(0));
    h = record(h, s(1), eq);
    h = record(h, s(2), eq);
    h = undo(h);
    expect(h.present.v).toBe(1);
    h = undo(h);
    expect(h.present.v).toBe(0);
    expect(h.past).toEqual([]);
    expect(h.future).toEqual([s(2), s(1)]);
  });

  it('does nothing on an empty stack', () => {
    const h = createHistory(s(0));
    expect(undo(h)).toBe(h);
  });
});
