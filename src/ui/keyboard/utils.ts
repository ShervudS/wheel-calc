/** Arrow direction: up and right increase, down and left decrease. */
export function arrowDir(key: string): 1 | -1 | 0 {
  if (key === 'ArrowUp' || key === 'ArrowRight') return 1;
  if (key === 'ArrowDown' || key === 'ArrowLeft') return -1;
  return 0;
}

/** History action for a shortcut: Ctrl/Cmd+Z undo, with Shift or Ctrl+Y redo. */
export function historyAction(
  e: Pick<KeyboardEvent, 'key' | 'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey'>,
): 'undo' | 'redo' | null {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return null;
  const k = e.key.toLowerCase();
  if (k === 'z') return e.shiftKey ? 'redo' : 'undo';
  if (k === 'y') return 'redo';
  return null;
}
