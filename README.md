# Wheel Calc

A wheel fitment calculator: ET offset, width, diameter, X-factor, backspacing, tire and stretched fitment. The wheel cross-section can be changed by dragging its lines, with the keyboard or through the form. Two themes and two languages (RU and EN).

Stack: TypeScript (strict) + Vite + Vitest, no UI framework. The reference behavior lives in `legacy/`.

## Getting started

Requires Node 20.19+.

```bash
npm install
npm run dev        # http://localhost:5173, EN at /en/
npm run build      # build into dist/
npm run preview    # preview the build
```

Formatting: `npm run format` (oxfmt). Linter settings are in `.oxlintrc.json`, formatter settings in `.oxfmtrc.json`.

> npm 10.9 has an arborist bug (`Cannot read properties of null (reading 'edgesOut')`) on a first install without a lock file. With `package-lock.json` everything works; if the lock file has to be regenerated, use `npx npm@11 install`.

## Checks

| Command             | What it does                                       |
| ------------------- | -------------------------------------------------- |
| `npm run typecheck` | `tsc --noEmit`                                     |
| `npm run lint`      | oxlint and the oxfmt format check                  |
| `npm run test`      | Vitest with coverage; 95% threshold for `src/core` |
| `npm run test:e2e`  | Playwright: dragging, touch, axe, screenshots      |
| `npm run check`     | typecheck + lint + test + build                    |

`npm run check` runs in the pre-commit git hook (simple-git-hooks); CI runs the same and e2e as a separate job. Before the first e2e run, install the browser with `npx playwright install chromium`.

## Site URL

canonical, `hreflang`, Open Graph, JSON-LD, `sitemap.xml` and `robots.txt` are generated at build time from `SITE_URL`:

```bash
SITE_URL=https://wheels.example npm run build
```

The variable can go into `.env` (see `.env.example`). Without it the build warns and falls back to `https://example.com`. The Russian page lives at the root (`/`), the English one at `/en/`.

## Deploying to GitHub Pages

Deployment is handled by the `.github/workflows/ci.yml` workflow: on a push to the default branch the `check` (types, lint, unit tests, build) and `e2e` jobs must pass, then the `deploy` job publishes the built `dist/` via `actions/deploy-pages`. Pull requests are checked but not deployed. To redeploy manually, use Actions → “CI and deploy” → Run workflow.

One-time setup in the GitHub repository:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Secrets and variables → Actions → Variables → New repository variable:** `SITE_URL` with the site URL, no trailing slash:
   - project site: `https://<user>.github.io/<repository>`;
   - custom domain: `https://wheels.example`.

   Without this variable the deployment stops with an error instead of publishing a site whose links point to `example.com`.

3. **Custom domain (optional):** Settings → Pages → Custom domain; at your registrar add a CNAME to `<user>.github.io`, then enable Enforce HTTPS and update `SITE_URL`.

Vite takes the site path from `SITE_URL` (`build/basePath.ts`): for `https://user.github.io/wheel-calc` all files are built under `/wheel-calc/`, for a custom domain under the root. Switching to a custom domain means changing a single variable.

Good to know:

- on the free plan, Pages works only for public repositories;
- on a project site `robots.txt` sits in a subfolder where search engines don't read it, so add `sitemap.xml` to Google Search Console and Yandex Webmaster manually; a custom domain doesn't have this problem;
- e2e screenshot tests compare against committed baselines (`e2e/calculator.spec.ts-snapshots/*-linux.png` in CI, `*-darwin.png` locally on macOS); a missing baseline fails the test. To (re)record the Linux baselines, run Actions → “CI and deploy” → Run workflow with **Re-record e2e screenshot baselines** checked: e2e passes, uploads the new PNGs as the `snapshots` artifact and nothing is deployed; commit those files. The e2e job is pinned to `ubuntu-24.04` because font rendering differs between OS images.

## Project structure

```
src/
  core/    pure functions without DOM, split by domain:
    types/    shared types: WheelState, Range
    utils/    shared utilities: clamp, round
    units/    mm and inches, length normalization
    wheel/    limits, max X, backspacing, keyboard steps
    tire/     tire sizes and fit warnings
    history/  undo and redo
    url/      link parameters
            each domain has its own constants.ts, types.ts and utils.ts
  data/    presets
  icons/   sprite.svg with all icons; IconId, ICON_IDS, iconMarkup
  i18n/    ru.json, en.json; constants (RUNTIME_KEYS), types, dictionaries, utils,
           translate (createTranslator for the browser), createT (for build and tests)
  page/    page template, per-language page build, SEO
  ui/      UI split by domain, each with its own constants.ts, types.ts, utils.ts:
    types/    shared types: Controller, HotKey
    utils/    shared utilities: DOM, value formatting
    app/      initApp: state, history, rendering
    diagram/  the diagram: geometry, render (state → SVG), dragging
    form/     fields, presets, tire and warnings
    keyboard/ arrow keys and shortcuts
    a11y/     screen reader labels
    share/    the Share button
    theme/    light and dark themes
  styles/  all styles: index.css (import order), tokens.css (colors, fonts, radii) and one file per UI part
  main.ts
build/     Vite plugin: pages from the template, sitemap and robots
e2e/       Playwright

Unit tests live next to the code: every module has a __tests__ folder
with one file per function (sum.spec.ts tests only sum).
index.html, en/index.html are Vite entries; the markup is built from src/page/template.html
```

The single source of truth is the `WheelState` object in millimetres. Lengths are normalized to thousandths of a millimetre so that float noise (17 × 25.4 = 431.79999…) doesn't break comparison with the default state. Inches appear only on output.

UI icons live in a single file, `src/icons/sprite.svg` (one `<symbol>` per icon). In the template they are inserted as `{{@icon:undo}}`, which becomes `<svg><use href="…/sprite.svg#undo">`, and Vite puts the sprite into the build with a hashed name. A test checks that the id list (`ICON_IDS`) matches the symbols in the sprite, and an unknown icon in the template fails the build. Icons are decorative (`aria-hidden`); the label stays as text. The diagram is not part of the icon set: its arrows are generated by `render.ts`.

All styles live in `src/styles/`, one file per UI part: `tokens.css`, `base.css`, `controls.css`, `icons.css`, `page.css`, `app.css`, `form.css`, `keyboard.css`, `diagram.css`. `src/styles/index.css` imports them in a fixed order and Vite bundles a single CSS file. Colors are defined once with `light-dark(light, dark)` in `tokens.css`; the theme follows the `color-scheme` property (system preference or the `data-theme` attribute). Requires browsers from 2024 or newer (Chrome 123, Safari 17.5, Firefox 120).

The diagram is drawn in three layers: the base, invisible hit areas and the highlight. Hover redraws only the highlight, so the nodes under the pointer are never recreated.

Texts live in `src/i18n/*.json`. Almost all of them are rendered into HTML at build time. Only the UI keys listed in `RUNTIME_KEYS` (`src/i18n/constants.ts`) reach the browser: the build embeds them in a `<script type="application/json" id="i18n">` on the page of their language, and the dictionaries themselves never reach the JS bundle. The UI `t()` accepts only these keys, so a new key missing from `RUNTIME_KEYS` is a compile error. Both dictionaries have the same keys and placeholders, which is checked at compile time and by tests.
