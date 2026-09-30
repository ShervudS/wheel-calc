import type { Translate } from '../../i18n/types.ts';
import { byId, qs } from '../utils/dom.ts';
import { THEME_KEY } from './constants.ts';
import type { Theme } from './types.ts';
import { readStoredTheme } from './utils.ts';

/** Theme follows the system by default; the user's choice is remembered. */
export function initTheme(doc: Document, win: Window, t: Translate, signal?: AbortSignal): void {
  const root = doc.documentElement;
  const btn = byId<HTMLButtonElement>(doc, 'tt');
  const label = byId(doc, 'ttl');
  const sun = qs<SVGElement>(btn, '[data-icon="sun"]');
  const moon = qs<SVGElement>(btn, '[data-icon="moon"]');
  const mq = win.matchMedia?.('(prefers-color-scheme: dark)');

  const saved = readStoredTheme(win);
  if (saved) root.setAttribute('data-theme', saved);

  const current = (): Theme => {
    const v = root.getAttribute('data-theme');
    if (v === 'light' || v === 'dark') return v;
    return mq?.matches ? 'dark' : 'light';
  };

  // The label and icon name the action ("Light theme"), so aria-pressed is not needed.
  const paint = () => {
    const dark = current() === 'dark';
    label.textContent = t(dark ? 'theme.toLight' : 'theme.toDark');
    sun.toggleAttribute('hidden', !dark);
    moon.toggleAttribute('hidden', dark);
  };

  btn.addEventListener('click', () => {
    const next: Theme = current() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try {
      win.localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage unavailable: the theme lasts until reload.
    }
    paint();
  });
  mq?.addEventListener?.(
    'change',
    () => {
      if (!root.hasAttribute('data-theme')) paint();
    },
    signal ? { signal } : {},
  );
  paint();
}
