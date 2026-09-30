import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { isLang } from '../src/i18n/utils.ts';
import { PAGE_MARKER, renderPage } from '../src/page/renderPage.ts';
import { normalizeSiteUrl, robotsTxt, sitemapXml } from '../src/page/seo.ts';

export const TEMPLATE_PATH = fileURLToPath(new URL('../src/page/template.html', import.meta.url));

export interface PagesPluginOptions {
  /** Site URL for canonical, hreflang, Open Graph and sitemap. */
  siteUrl: string;
  /** Defaults to src/page/template.html. */
  templatePath?: string;
}

/**
 * Builds one page per language from a single template and the i18n dictionaries,
 * injects SEO tags and emits sitemap.xml and robots.txt.
 */
export function pagesPlugin(options: PagesPluginOptions): Plugin {
  const siteUrl = normalizeSiteUrl(options.siteUrl);
  const templatePath = options.templatePath ?? TEMPLATE_PATH;
  return {
    name: 'wheel-calc-pages',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const m = PAGE_MARKER.exec(html);
        if (!m) return html;
        const lang = m[1];
        if (!isLang(lang)) throw new Error(`Unknown page language: ${String(lang)}`);
        return renderPage(readFileSync(templatePath, 'utf8'), lang, siteUrl);
      },
    },
    configureServer(server) {
      server.watcher.add(templatePath);
      server.watcher.on('change', (file) => {
        if (file === templatePath) server.ws.send({ type: 'full-reload' });
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(siteUrl) });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt(siteUrl) });
    },
  };
}
