import { THEME_KEY } from './constants.ts';
import type { Theme } from './types.ts';

export function readStoredTheme(win: Window): Theme | null {
  try {
    const v = win.localStorage.getItem(THEME_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}
