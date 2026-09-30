import { toQuery } from '../../core/url/urlState.ts';
import type { Controller } from '../types/controller.ts';
import { byId, qs } from '../utils/dom.ts';
import { COPIED_MS, URL_DELAY } from './constants.ts';
import type { Share } from './types.ts';
import { copyText, isAbortError } from './utils.ts';

/**
 * Share button: the system share sheet when available (phones, some desktops),
 * otherwise the link is copied and the icon briefly turns into a check mark.
 */
export function createShare(doc: Document, win: Window, ctrl: Controller): Share {
  const btn = byId<HTMLButtonElement>(doc, 'share');
  const status = byId(doc, 'shareStatus');
  const shareIcon = qs<SVGElement>(btn, '[data-icon="share"]');
  const check = qs<SVGElement>(btn, '[data-icon="check"]');
  const langLink = byId<HTMLAnchorElement>(doc, 'lang');
  const langBase = langLink.getAttribute('href') ?? '';
  let url = '';
  let urlTimer: ReturnType<typeof setTimeout> | undefined;
  let copiedTimer: ReturnType<typeof setTimeout> | undefined;

  function sync(): void {
    const query = toQuery(ctrl.state, ctrl.unit);
    const base = win.location.href.split(/[?#]/)[0] ?? '';
    url = `${base}?${query}`;
    // Switching language keeps the same parameters.
    langLink.setAttribute('href', `${langBase}?${query}`);
    clearTimeout(urlTimer);
    urlTimer = setTimeout(() => {
      try {
        win.history.replaceState(null, '', `${win.location.pathname}?${query}${win.location.hash}`);
      } catch {
        // In a sandbox (e.g. an iframe) the URL can't change; the share link is still correct.
      }
    }, URL_DELAY);
  }

  function showCopied(copied: boolean): void {
    shareIcon.toggleAttribute('hidden', copied);
    check.toggleAttribute('hidden', !copied);
    status.textContent = copied ? ctrl.t('share.copied') : '';
  }

  async function copy(): Promise<void> {
    if (!(await copyText(doc, win, url))) return;
    showCopied(true);
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => showCopied(false), COPIED_MS);
  }

  async function share(): Promise<void> {
    const nav = win.navigator;
    const data = { title: ctrl.t('meta.ogTitle'), url };
    if (typeof nav.share === 'function' && (nav.canShare?.(data) ?? true)) {
      try {
        await nav.share(data);
        return;
      } catch (e) {
        if (isAbortError(e)) return;
        // Share sheet unavailable (e.g. no user gesture): copy the link instead.
      }
    }
    await copy();
  }

  btn.addEventListener('click', () => void share());
  showCopied(false);
  return { sync };
}
