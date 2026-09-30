// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { normalizeSiteUrl } from '../seo.ts';

const SITE = 'https://wheels.example';

describe('normalizeSiteUrl', () => {
  it('strips the trailing slash and extras', () => {
    expect(normalizeSiteUrl('https://wheels.example/')).toBe(SITE);
    expect(normalizeSiteUrl('https://wheels.example/calc/?a=1#x')).toBe(`${SITE}/calc`);
  });
});
