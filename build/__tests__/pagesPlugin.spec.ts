// @vitest-environment happy-dom
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const SITE = 'https://wheels.example';
const SUB_SITE = 'https://user.github.io/wheel-calc';

let outDir = '';
let subDir = '';

const read = (file: string) => readFileSync(join(outDir, file), 'utf8');

const readSub = (file: string) => readFileSync(join(subDir, file), 'utf8');

const parse = (html: string) => new DOMParser().parseFromString(html, 'text/html');

async function buildSite(siteUrl: string): Promise<string> {
  const dir = mkdtempSync(join(tmpdir(), 'wheel-calc-build-'));
  const prev = process.env['SITE_URL'];
  process.env['SITE_URL'] = siteUrl;
  try {
    await build({ logLevel: 'silent', build: { outDir: dir, emptyOutDir: true } });
  } finally {
    if (prev === undefined) delete process.env['SITE_URL'];
    else process.env['SITE_URL'] = prev;
  }
  return dir;
}

beforeAll(async () => {
  outDir = await buildSite(SITE);
  subDir = await buildSite(SUB_SITE);
}, 120_000);

afterAll(() => {
  for (const dir of [outDir, subDir]) if (dir) rmSync(dir, { recursive: true, force: true });
});

describe.each([
  ['ru', 'index.html', `${SITE}/`, 'og-image.png'],
  ['en', 'en/index.html', `${SITE}/en/`, 'og-image-en.png'],
] as const)('page %s', (lang, file, url, ogImage) => {
  const doc = () => parse(read(file));
  const attr = (sel: string, name: string) => doc().querySelector(sel)?.getAttribute(name);

  it('language and a single h1', () => {
    expect(doc().documentElement.lang).toBe(lang);
    expect(doc().querySelectorAll('h1')).toHaveLength(1);
  });

  it('canonical', () => {
    expect(attr('link[rel="canonical"]', 'href')).toBe(url);
  });

  it('hreflang for both languages and x-default', () => {
    expect(attr('link[hreflang="ru"]', 'href')).toBe(`${SITE}/`);
    expect(attr('link[hreflang="en"]', 'href')).toBe(`${SITE}/en/`);
    expect(attr('link[hreflang="x-default"]', 'href')).toBe(`${SITE}/`);
  });

  it('Open Graph', () => {
    expect(attr('meta[property="og:image"]', 'content')).toBe(`${SITE}/${ogImage}`);
    expect(attr('meta[property="og:url"]', 'content')).toBe(url);
    expect(attr('meta[property="og:title"]', 'content')).toBeTruthy();
  });

  it('valid JSON-LD', () => {
    const raw = doc().querySelector('script[type="application/ld+json"]')?.textContent ?? '';
    const ld = JSON.parse(raw) as { '@graph': { '@type': string; inLanguage?: string }[] };
    expect(ld['@graph'].map((n) => n['@type'])).toEqual(['WebApplication', 'FAQPage']);
    expect(ld['@graph'][0]?.inLanguage).toBe(lang);
  });

  it('script and styles come from the build', () => {
    const html = read(file);
    expect(html).toMatch(/<script type="module" crossorigin src="\/assets\/[^"]+\.js">/);
    expect(html).toMatch(/<link rel="stylesheet" crossorigin href="\/assets\/[^"]+\.css">/);
    expect(html).not.toContain('/src/main.ts');
  });

  it('icons reference the hashed sprite from the build, and the file exists', () => {
    const refs = [...read(file).matchAll(/<use href="([^"#]+)#([\w-]+)"/g)];
    expect(refs.length).toBeGreaterThan(0);
    const files = new Set(refs.map((m) => m[1]));
    expect([...files]).toEqual([expect.stringMatching(/^\/assets\/sprite-[\w-]+\.svg$/)]);
    const [spritePath = ''] = files;
    const sprite = read(spritePath.slice(1));
    for (const m of refs) expect(sprite).toContain(`id="${m[2]}"`);
  });

  it('Open Graph image is in the build', () => {
    expect(readFileSync(join(outDir, ogImage)).length).toBeGreaterThan(1000);
  });
});

describe('JS bundle', () => {
  it('no dictionaries: no Cyrillic, no landing texts', () => {
    const html = read('index.html');
    const src = /<script type="module" crossorigin src="\/([^"]+\.js)">/.exec(html)?.[1] ?? '';
    const js = read(src);
    expect(js.length).toBeGreaterThan(1000);
    expect(js).not.toMatch(/[\u0400-\u04FF]/);
    expect(js).not.toContain('Wheel offset & fitment calculator');
  });

  it('UI keys are embedded in the page of their language', () => {
    for (const [file, text] of [
      ['index.html', 'Ссылка скопирована'],
      ['en/index.html', 'Link copied'],
    ] as const) {
      const raw = /<script type="application\/json" id="i18n">([\s\S]*?)<\/script>/.exec(
        read(file),
      )?.[1];
      expect(JSON.parse(raw ?? '{}')['share.copied']).toBe(text);
    }
  });
});

describe('service files', () => {
  it('valid sitemap.xml', () => {
    const xml = read('sitemap.xml');
    const doc = new DOMParser().parseFromString(xml, 'application/xml');
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0);
    expect([...doc.getElementsByTagName('loc')].map((l) => l.textContent)).toEqual([
      `${SITE}/`,
      `${SITE}/en/`,
    ]);
  });

  it('robots.txt with the sitemap URL', () => {
    expect(read('robots.txt')).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });
});

describe('site in a subfolder (GitHub Pages project site)', () => {
  it.each(['index.html', 'en/index.html'])(
    '%s: all local paths start with /wheel-calc/',
    (file) => {
      const paths = [...readSub(file).matchAll(/(?:href|src)="(\/[^"]*)"/g)].map((m) => m[1] ?? '');
      expect(paths.length).toBeGreaterThan(5);
      expect(paths.filter((p) => !p.startsWith('/wheel-calc/'))).toEqual([]);
    },
  );

  it('canonical, sitemap and robots include the subfolder', () => {
    expect(readSub('en/index.html')).toContain(`<link rel="canonical" href="${SUB_SITE}/en/" />`);
    expect(readSub('sitemap.xml')).toContain(`<loc>${SUB_SITE}/</loc>`);
    expect(readSub('robots.txt')).toContain(`Sitemap: ${SUB_SITE}/sitemap.xml`);
  });
});
