// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { $, mount, type } from '../../__tests__/mount.ts';
import { COPIED_MS, URL_DELAY } from '../constants.ts';

const Q = 'd=431.8&w=203.2&et=20&x=40&u=mm';

function stubNavigator(props: { share?: unknown; canShare?: unknown; clipboard?: unknown }) {
  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(navigator, key, { value, configurable: true });
  }
}

const iconShown = (id: string) => !$(`#share [data-icon="${id}"]`).hasAttribute('hidden');

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  stubNavigator({ share: undefined, canShare: undefined, clipboard: undefined });
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createShare', () => {
  it('page URL and the other language link are updated', () => {
    mount();
    type('ET', '20');
    expect($('#lang').getAttribute('href')).toBe(`en/?${Q}`);
    vi.advanceTimersByTime(URL_DELAY);
    expect(location.search).toBe(`?${Q}`);
  });

  it('icon button with a label for screen readers', () => {
    mount();
    expect($('#share').getAttribute('aria-label')).toBe('Поделиться ссылкой на конфигурацию');
    expect(iconShown('share')).toBe(true);
    expect(iconShown('check')).toBe(false);
  });

  it('system share sheet available: opens it with the current link', async () => {
    mount();
    type('ET', '20');
    const share = vi.fn<(data: ShareData) => Promise<void>>(() => Promise.resolve());
    const writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
    stubNavigator({ share, clipboard: { writeText } });
    $('#share').click();
    await vi.waitFor(() => expect(share).toHaveBeenCalled());
    expect(share.mock.calls[0]?.[0]).toEqual({
      title: 'Калькулятор параметров дисков онлайн',
      url: `${location.origin}/?${Q}`,
    });
    expect(writeText).not.toHaveBeenCalled();
  });

  it('share sheet closed: copies nothing', async () => {
    mount();
    const share = vi.fn<(data: ShareData) => Promise<void>>(() =>
      Promise.reject(new DOMException('cancel', 'AbortError')),
    );
    const writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
    stubNavigator({ share, clipboard: { writeText } });
    $('#share').click();
    await vi.waitFor(() => expect(share).toHaveBeenCalled());
    await Promise.resolve();
    expect(writeText).not.toHaveBeenCalled();
    expect(iconShown('check')).toBe(false);
  });

  it('share sheet failed for another reason: copies the link', async () => {
    mount();
    const share = vi.fn<(data: ShareData) => Promise<void>>(() =>
      Promise.reject(new DOMException('no', 'NotAllowedError')),
    );
    const writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
    stubNavigator({ share, clipboard: { writeText } });
    $('#share').click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalled());
  });

  it('canShare refused: copies the link', async () => {
    mount();
    const share = vi.fn<(data: ShareData) => Promise<void>>(() => Promise.resolve());
    const writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
    stubNavigator({ share, canShare: () => false, clipboard: { writeText } });
    $('#share').click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalled());
    expect(share).not.toHaveBeenCalled();
  });

  it('no share sheet: copies the link, shows a check mark and announcement, then reverts', async () => {
    mount();
    type('ET', '20');
    const writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
    stubNavigator({ clipboard: { writeText } });
    $('#share').click();
    await vi.waitFor(() => expect(iconShown('check')).toBe(true));
    expect(writeText).toHaveBeenCalledWith(`${location.origin}/?${Q}`);
    expect(iconShown('share')).toBe(false);
    expect($('#shareStatus').textContent).toBe('Ссылка скопирована');
    vi.advanceTimersByTime(COPIED_MS);
    expect(iconShown('check')).toBe(false);
    expect(iconShown('share')).toBe(true);
    expect($('#shareStatus').textContent).toBe('');
  });

  it('copy failed: no check mark', async () => {
    mount();
    Object.defineProperty(document, 'execCommand', { value: () => false, configurable: true });
    $('#share').click();
    await Promise.resolve();
    await Promise.resolve();
    expect(iconShown('check')).toBe(false);
  });
});
