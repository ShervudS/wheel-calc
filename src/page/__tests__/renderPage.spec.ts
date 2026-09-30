// @vitest-environment happy-dom
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DICTS } from '../../i18n/dictionaries.ts';
import { parseRuntimeMessages, pickRuntime } from '../../i18n/utils.ts';
import { renderPage } from '../renderPage.ts';

const SITE = 'https://wheels.example';

const TEMPLATE = readFileSync('src/page/template.html', 'utf8');

describe('renderPage', () => {
  it('fills in all keys and service values', () => {
    for (const lang of ['ru', 'en'] as const) {
      const html = renderPage(TEMPLATE, lang, SITE);
      expect(html).not.toMatch(/\{\{/);
      expect(html).not.toContain('<!--seo-->');
      expect(html).toContain(`<html lang="${lang}">`);
    }
  });

  it('link to the other language', () => {
    expect(renderPage(TEMPLATE, 'ru', SITE)).toMatch(
      /href="en\/" hreflang="en" lang="en">English</,
    );
    expect(renderPage(TEMPLATE, 'en', SITE)).toMatch(
      /href="\.\.\/" hreflang="ru" lang="ru">Русский</,
    );
  });

  it('_html keys are inserted as markup, others are escaped', () => {
    const html = renderPage(TEMPLATE, 'en', SITE);
    expect(html).toContain(
      '<h1 class="hero__title">Wheel offset &amp; fitment calculator online: <em>ET offset</em>',
    );
    expect(html).toContain('<title>Wheel Offset &amp; Fitment Calculator Online');
  });

  it('{{@icon:id}} inserts a sprite icon', () => {
    expect(renderPage('{{@icon:undo}}', 'ru', SITE)).toContain(
      '<use href="/src/icons/sprite.svg#undo">',
    );
    const html = renderPage(TEMPLATE, 'ru', SITE);
    expect(html.match(/data-icon="plus"/g)).toHaveLength(5);
    expect(html).not.toMatch(/[↶↷☀☾✓↓]/);
  });

  it('embeds UI keys of its language in <script id="i18n">', () => {
    for (const lang of ['ru', 'en'] as const) {
      const html = renderPage(TEMPLATE, lang, SITE);
      const raw = /<script type="application\/json" id="i18n">([\s\S]*?)<\/script>/.exec(html)?.[1];
      expect(raw, lang).toBeDefined();
      expect(parseRuntimeMessages(raw ?? '')).toEqual(pickRuntime(DICTS[lang]));
    }
  });

  it('unknown icon: build error', () => {
    expect(() => renderPage('{{@icon:nope}}', 'ru', SITE)).toThrow(/Unknown icon: nope/);
  });

  it('unknown key: build error', () => {
    expect(() => renderPage('{{nope.key}}', 'ru', SITE)).toThrow(/nope\.key/);
    expect(() => renderPage('{{{nope}}}', 'ru', SITE)).toThrow(/nope/);
    expect(() => renderPage('{{@nope}}', 'ru', SITE)).toThrow(/@nope/);
  });
});
