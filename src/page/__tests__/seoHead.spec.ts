// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { seoHead } from '../seo.ts';

const SITE = 'https://wheels.example';

describe('seoHead', () => {
  it('canonical, hreflang, og and JSON-LD', () => {
    const head = seoHead('en', SITE);
    expect(head).toContain(`<link rel="canonical" href="${SITE}/en/" />`);
    expect(head).toContain(`hreflang="ru" href="${SITE}/"`);
    expect(head).toContain(`hreflang="en" href="${SITE}/en/"`);
    expect(head).toContain(`hreflang="x-default" href="${SITE}/"`);
    expect(head).toContain(`<meta property="og:image" content="${SITE}/og-image-en.png" />`);
    expect(head).toContain('content="en_US"');
    expect(head).toContain('Wheel Offset &amp; Fitment Calculator Online');
  });

  it('JSON in a script cannot close the tag', () => {
    expect(seoHead('ru', SITE)).not.toMatch(/<\/script>.*<\/script>/s);
    expect(seoHead('ru', SITE).match(/<script[\s\S]*?<\/script>/)?.[0]).not.toMatch(
      /<(?!\/?script)/,
    );
  });
});
