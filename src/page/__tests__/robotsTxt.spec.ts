// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { robotsTxt } from '../seo.ts';

const SITE = 'https://wheels.example';

describe('robotsTxt', () => {
  it('robots points to the sitemap', () => {
    expect(robotsTxt(`${SITE}/`)).toBe(`User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  });
});
