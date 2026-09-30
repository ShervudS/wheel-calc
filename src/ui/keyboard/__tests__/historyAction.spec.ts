// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { historyAction } from '../utils.ts';

describe('historyAction', () => {
  it('historyAction', () => {
    const e = { ctrlKey: false, metaKey: false, altKey: false, shiftKey: false };
    expect(historyAction({ ...e, key: 'z' })).toBeNull();
    expect(historyAction({ ...e, key: 'z', ctrlKey: true })).toBe('undo');
    expect(historyAction({ ...e, key: 'Z', metaKey: true, shiftKey: true })).toBe('redo');
    expect(historyAction({ ...e, key: 'y', ctrlKey: true })).toBe('redo');
    expect(historyAction({ ...e, key: 'x', ctrlKey: true })).toBeNull();
    expect(historyAction({ ...e, key: 'z', ctrlKey: true, altKey: true })).toBeNull();
  });
});
