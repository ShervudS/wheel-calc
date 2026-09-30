// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { altLang } from '../renderPage.ts';

describe('altLang', () => {
  it('altLang', () => {
    expect(altLang('ru')).toBe('en');
    expect(altLang('en')).toBe('ru');
  });
});
