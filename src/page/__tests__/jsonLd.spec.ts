// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { jsonLd } from '../seo.ts';

const SITE = 'https://wheels.example';

describe('jsonLd', () => {
  it('JSON-LD: application and FAQ from the visible questions', () => {
    const ld = jsonLd('ru', SITE) as { '@graph': [{ url: string }, { mainEntity: unknown[] }] };
    expect(ld['@graph'][0].url).toBe(`${SITE}/`);
    expect(ld['@graph'][1].mainEntity).toHaveLength(5);
  });
});
