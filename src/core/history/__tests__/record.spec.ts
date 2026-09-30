import { describe, expect, it } from 'vitest';
import { HISTORY_LIMIT } from '../constants.ts';
import { canRedo, canUndo, createHistory, record, undo } from '../history.ts';
import { eq, s } from './testState.ts';

describe('record', () => {
  it('a new action clears redo', () => {
    let h = createHistory(s(0));
    h = record(h, s(1), eq);
    h = undo(h);
    expect(canRedo(h)).toBe(true);
    h = record(h, s(5), eq);
    expect(canRedo(h)).toBe(false);
    expect(h.past).toEqual([s(0)]);
  });

  it('a repeated state does not create a step', () => {
    let h = createHistory(s(0));
    h = record(h, s(1), eq);
    const same = record(h, s(1), eq);
    expect(same).toBe(h);
    expect(same.past).toHaveLength(1);
  });

  it(`limit of ${HISTORY_LIMIT} steps`, () => {
    let h = createHistory(s(0));
    for (let i = 1; i <= HISTORY_LIMIT + 20; i++) h = record(h, s(i), eq);
    expect(h.past).toHaveLength(HISTORY_LIMIT);
    expect(h.past[0]).toEqual(s(20));
    let n = 0;
    while (canUndo(h)) {
      h = undo(h);
      n++;
    }
    expect(n).toBe(HISTORY_LIMIT);
  });

  it('Reset is a regular step and can be undone', () => {
    let h = createHistory(s(0));
    h = record(h, s(7), eq);
    h = record(h, s(0), eq); // reset to defaults
    expect(h.present.v).toBe(0);
    h = undo(h);
    expect(h.present.v).toBe(7);
  });

  it('does not mutate the previous history', () => {
    const h0 = createHistory(s(0));
    const h1 = record(h0, s(1), eq);
    undo(h1);
    expect(h0.past).toEqual([]);
    expect(h1.present.v).toBe(1);
    expect(h1.past).toEqual([s(0)]);
  });

  it('compares structurally by default', () => {
    let h = createHistory(s(0));
    h = record(h, s(0));
    expect(canUndo(h)).toBe(false);
  });
});
