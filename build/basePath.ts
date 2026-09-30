import { normalizeSiteUrl } from '../src/page/seo.ts';

/**
 * Site path from the domain root, used as Vite's base.
 * https://user.github.io/wheel-calc → /wheel-calc/, custom domain https://wheels.example → /.
 */
export function basePath(siteUrl: string): string {
  const { pathname } = new URL(normalizeSiteUrl(siteUrl));
  return pathname === '/' ? '/' : `${pathname}/`;
}
