// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText } from '../utils.ts';

function stubClipboard(value: unknown) {
  Object.defineProperty(navigator, 'clipboard', { value, configurable: true });
}
function stubExec(fn: (command: string) => boolean) {
  const exec = vi.fn<(command: string) => boolean>(fn);
  Object.defineProperty(document, 'execCommand', { value: exec, configurable: true });
  return exec;
}

afterEach(() => stubClipboard(undefined));

describe('copyText', () => {
  it('writes via the Clipboard API', async () => {
    const writeText = vi.fn<(text: string) => Promise<void>>(() => Promise.resolve());
    stubClipboard({ writeText });
    expect(await copyText(document, window, 'abc')).toBe(true);
    expect(writeText).toHaveBeenCalledWith('abc');
  });

  it('without the Clipboard API copies via a temporary field and removes it', async () => {
    stubClipboard(undefined);
    let copied = '';
    stubExec(() => {
      copied = document.querySelector('textarea')?.value ?? '';
      return true;
    });
    expect(await copyText(document, window, 'xyz')).toBe(true);
    expect(copied).toBe('xyz');
    expect(document.querySelector('textarea')).toBeNull();
  });

  it('Clipboard API refused: tries the fallback', async () => {
    stubClipboard({ writeText: () => Promise.reject(new Error('denied')) });
    const exec = stubExec(() => true);
    expect(await copyText(document, window, 'q')).toBe(true);
    expect(exec).toHaveBeenCalledWith('copy');
  });

  it('nothing worked: false', async () => {
    stubClipboard(undefined);
    stubExec(() => {
      throw new Error('nope');
    });
    expect(await copyText(document, window, 'q')).toBe(false);
  });
});
