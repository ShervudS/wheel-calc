import { DEFAULT_LANG, LANGS } from '../i18n/constants.ts';
import { DICTS } from '../i18n/dictionaries.ts';
import type { Lang, MessageKey } from '../i18n/types.ts';
import { escapeXml, scriptJson } from '../util/escape.ts';

/** Page path of each language from the site root. */
export const PAGE_PATHS: Readonly<Record<Lang, string>> = { ru: '/', en: '/en/' };

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

const FAQ_COUNT = 5;

export function normalizeSiteUrl(siteUrl: string): string {
  const url = new URL(siteUrl);
  return url.origin + url.pathname.replace(/\/+$/, '');
}

export function pageUrl(siteUrl: string, lang: Lang): string {
  return normalizeSiteUrl(siteUrl) + PAGE_PATHS[lang];
}

export function jsonLd(lang: Lang, siteUrl: string): object {
  const d = DICTS[lang];
  const faq = Array.from({ length: FAQ_COUNT }, (_, i) => ({
    '@type': 'Question',
    name: d[`faq.${i + 1}.q` as MessageKey],
    acceptedAnswer: { '@type': 'Answer', text: d[`faq.${i + 1}.a` as MessageKey] },
  }));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: d['meta.appName'],
        url: pageUrl(siteUrl, lang),
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        inLanguage: lang,
        description: d['meta.appDescription'],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      { '@type': 'FAQPage', mainEntity: faq },
    ],
  };
}

/** canonical, hreflang, Open Graph and JSON-LD for a language page. */
export function seoHead(lang: Lang, siteUrl: string): string {
  const d = DICTS[lang];
  const url = pageUrl(siteUrl, lang);
  const attr = escapeXml;
  const alternates = [
    ...LANGS.map(
      (l) => `<link rel="alternate" hreflang="${l}" href="${attr(pageUrl(siteUrl, l))}" />`,
    ),
    `<link rel="alternate" hreflang="x-default" href="${attr(pageUrl(siteUrl, DEFAULT_LANG))}" />`,
  ];
  const image = `${normalizeSiteUrl(siteUrl)}/${d['meta.ogImage']}`;
  return [
    `<link rel="canonical" href="${attr(url)}" />`,
    ...alternates,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:locale" content="${attr(d['meta.ogLocale'])}" />`,
    `<meta property="og:url" content="${attr(url)}" />`,
    `<meta property="og:title" content="${attr(d['meta.ogTitle'])}" />`,
    `<meta property="og:description" content="${attr(d['meta.ogDescription'])}" />`,
    `<meta property="og:image" content="${attr(image)}" />`,
    `<meta property="og:image:width" content="${OG_IMAGE_SIZE.width}" />`,
    `<meta property="og:image:height" content="${OG_IMAGE_SIZE.height}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<script type="application/ld+json">${scriptJson(jsonLd(lang, siteUrl))}</script>`,
  ].join('\n    ');
}

export function sitemapXml(siteUrl: string): string {
  const alternates = [
    ...LANGS.map(
      (l) =>
        `    <xhtml:link rel="alternate" hreflang="${l}" href="${escapeXml(pageUrl(siteUrl, l))}"/>`,
    ),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(pageUrl(siteUrl, DEFAULT_LANG))}"/>`,
  ].join('\n');
  const urls = LANGS.map(
    (l) =>
      `  <url>\n    <loc>${escapeXml(pageUrl(siteUrl, l))}</loc>\n${alternates}\n    <changefreq>monthly</changefreq>\n    <priority>${l === DEFAULT_LANG ? '1.0' : '0.9'}</priority>\n  </url>`,
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
}

export function robotsTxt(siteUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${normalizeSiteUrl(siteUrl)}/sitemap.xml\n`;
}
