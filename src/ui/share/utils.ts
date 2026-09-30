/** The user closed the share sheet: not an error, nothing to copy. */
export function isAbortError(e: unknown): boolean {
  return typeof e === 'object' && e !== null && 'name' in e && e.name === 'AbortError';
}

/**
 * Copies text to the clipboard: Clipboard API first, otherwise execCommand via a
 * temporary hidden field. Returns whether copying succeeded.
 */
export async function copyText(doc: Document, win: Window, text: string): Promise<boolean> {
  try {
    if (win.navigator.clipboard?.writeText) {
      await win.navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // No permission or insecure context: fall back to the old way.
  }
  const area = doc.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  doc.body.appendChild(area);
  area.select();
  try {
    return doc.execCommand('copy');
  } catch {
    return false;
  } finally {
    area.remove();
  }
}
