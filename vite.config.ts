import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import { basePath } from './build/basePath.ts';
import { pagesPlugin } from './build/pagesPlugin.ts';

const PLACEHOLDER_SITE = 'https://example.com';

export default defineConfig(({ command, mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  let siteUrl = env['SITE_URL'];
  if (!siteUrl) {
    siteUrl = command === 'serve' ? 'http://localhost:5173' : PLACEHOLDER_SITE;
    if (command === 'build') {
      console.warn(
        `\n⚠ SITE_URL is not set: canonical, hreflang and sitemap will point to ${PLACEHOLDER_SITE}.\n`,
      );
    }
  }
  return {
    // Site in a subfolder (GitHub Pages project site): all build paths are relative to it.
    base: basePath(siteUrl),
    plugins: [pagesPlugin({ siteUrl })],
    build: {
      rollupOptions: {
        input: {
          ru: fileURLToPath(new URL('./index.html', import.meta.url)),
          en: fileURLToPath(new URL('./en/index.html', import.meta.url)),
        },
      },
    },
  };
});
