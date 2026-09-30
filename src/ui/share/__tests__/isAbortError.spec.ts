// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { isAbortError } from '../utils.ts';

describe('isAbortError', () => {
  it('recognizes cancelling the share sheet', () => {
    expect(isAbortError(new DOMException('cancel', 'AbortError'))).toBe(true);
    expect(isAbortError({ name: 'AbortError' })).toBe(true);
  });

  it('other errors and non-errors: no', () => {
    expect(isAbortError(new DOMException('no', 'NotAllowedError'))).toBe(false);
    expect(isAbortError(new Error('x'))).toBe(false);
    expect(isAbortError(null)).toBe(false);
    expect(isAbortError('AbortError')).toBe(false);
  });
});
