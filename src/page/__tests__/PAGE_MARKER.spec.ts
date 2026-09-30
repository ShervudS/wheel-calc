// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { PAGE_MARKER } from '../renderPage.ts';

describe('PAGE_MARKER', () => {
  it('entry page marker', () => {
    expect(PAGE_MARKER.exec('<!-- wheel-calc:page lang=en -->')?.[1]).toBe('en');
    expect(PAGE_MARKER.exec('<html>')).toBeNull();
  });
});
