// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { sitemapXml } from '../seo.ts';

const SITE = 'https://wheels.example';

describe('sitemapXml', () => {
  it('sitemap with both languages and alternates', () => {
    const xml = sitemapXml(SITE);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml.match(/<url>/g)).toHaveLength(2);
    expect(xml).toContain(`<loc>${SITE}/</loc>`);
    expect(xml).toContain(`<loc>${SITE}/en/</loc>`);
    expect(xml.match(/hreflang="x-default"/g)).toHaveLength(2);
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
  });
});
