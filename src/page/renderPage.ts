import { LANGS } from '../i18n/constants.ts';
import { RUNTIME_SCRIPT_ID } from '../i18n/constants.ts';
import { DICTS } from '../i18n/dictionaries.ts';
import type { Lang, MessageKey } from '../i18n/types.ts';
import { iconMarkup } from '../icons/icon.ts';
import { isIconId } from '../icons/utils.ts';
import { pickRuntime } from '../i18n/utils.ts';
import { escapeXml, scriptJson } from '../util/escape.ts';
import { seoHead } from './seo.ts';

/** Marker in the entry HTML files, replaced with the page of that language. */
export const PAGE_MARKER = /<!--\s*wheel-calc:page\s+lang=(\w+)\s*-->/;

/** Relative link to the other language page: ru → "en/", en → "../". */
const ALT_HREF: Readonly<Record<Lang, string>> = { ru: 'en/', en: '../' };

export function altLang(lang: Lang): Lang {
  return LANGS.find((l) => l !== lang) ?? lang;
}

/**
 * Builds a page from the template: {{key}} — escaped dictionary text,
 * {{{key}}} — markup from *_html keys, {{@icon:id}} — sprite icon,
 * {{@…}} — service values, <!--seo--> — SEO tags,
 * <!--i18n--> — UI keys of this language for the browser.
 */
export function renderPage(template: string, lang: Lang, siteUrl: string): string {
  const dict = DICTS[lang];
  const other = altLang(lang);
  const special: Readonly<Record<string, string>> = {
    lang,
    altLang: other,
    altHref: ALT_HREF[lang],
    altName: DICTS[other]['lang.name'],
  };
  const lookup = (key: string): string => {
    if (!Object.hasOwn(dict, key)) throw new Error(`Unknown i18n key in template: ${key}`);
    return dict[key as MessageKey];
  };
  return template
    .replace('<!--seo-->', seoHead(lang, siteUrl))
    .replace(
      '<!--i18n-->',
      `<script type="application/json" id="${RUNTIME_SCRIPT_ID}">${scriptJson(pickRuntime(dict))}</script>`,
    )
    .replace(/\{\{\{([\w.]+)\}\}\}/g, (_, key: string) => lookup(key))
    .replace(/\{\{@icon:([\w-]+)\}\}/g, (_, id: string) => {
      if (!isIconId(id)) throw new Error(`Unknown icon: ${id}`);
      return iconMarkup(id);
    })
    .replace(/\{\{@(\w+)\}\}/g, (_, key: string) => {
      const v = special[key];
      if (v === undefined) throw new Error(`Unknown template value: @${key}`);
      return escapeXml(v);
    })
    .replace(/\{\{([\w.]+)\}\}/g, (_, key: string) => escapeXml(lookup(key)));
}
