import { readFileSync } from 'node:fs';
import type { Lang } from '../../i18n/types.ts';
import { renderPage } from '../../page/renderPage.ts';
import { initApp } from '../app/app.ts';
import type { Controller } from '../types/controller.ts';

const TEMPLATE = readFileSync('src/page/template.html', 'utf8');
let abort: AbortController | null = null;

/** Mounts a language page from the real template and starts the app. */
export function mount(lang: Lang = 'ru', search = ''): Controller {
  abort?.abort();
  abort = new AbortController();
  const html = renderPage(TEMPLATE, lang, 'https://example.com');
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  document.documentElement.lang = lang;
  document.documentElement.removeAttribute('data-theme');
  document.body.innerHTML = parsed.body.innerHTML;
  window.history.replaceState(null, '', `/${search}`);
  return initApp(document, window, { signal: abort.signal });
}

export const $ = <T extends Element = HTMLElement>(sel: string): T => {
  const el = document.querySelector(sel);
  if (!el) throw new Error(`${sel} not found`);
  return el as T;
};

export const input = (id: string) => $<HTMLInputElement>(`#${id}`);

export function type(id: string, value: string): void {
  const el = input(id);
  el.value = value;
  el.dispatchEvent(new Event('input', { bubbles: true }));
}

export function change(id: string): void {
  input(id).dispatchEvent(new Event('change', { bubbles: true }));
}

export function key(target: EventTarget, init: KeyboardEventInit): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }));
}
