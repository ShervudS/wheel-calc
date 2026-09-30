// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { pageUrl } from '../seo.ts';

const SITE = 'https://wheels.example';

describe('pageUrl', () => {
  it('language pages', () => {
    expect(pageUrl(SITE, 'ru')).toBe(`${SITE}/`);
    expect(pageUrl(`${SITE}/`, 'en')).toBe(`${SITE}/en/`);
  });
});
