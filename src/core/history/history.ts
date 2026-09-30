import { HISTORY_LIMIT } from './constants.ts';
import type { Equals, History } from './types.ts';
import { structuralEquals } from './utils.ts';

export function createHistory<T>(present: T): History<T> {
  return { past: [], present, future: [] };
}

/** Records a new state. A state equal to the present is ignored; future is cleared. */
export function record<T>(
  h: History<T>,
  next: T,
  equals: Equals<T> = structuralEquals,
): History<T> {
  if (equals(h.present, next)) return h;
  const past = [...h.past, h.present];
  if (past.length > HISTORY_LIMIT) past.splice(0, past.length - HISTORY_LIMIT);
  return { past, present: next, future: [] };
}

export function canUndo<T>(h: History<T>): boolean {
  return h.past.length > 0;
}

export function canRedo<T>(h: History<T>): boolean {
  return h.future.length > 0;
}

export function undo<T>(h: History<T>): History<T> {
  const prev = h.past.at(-1);
  if (prev === undefined) return h;
  return { past: h.past.slice(0, -1), present: prev, future: [...h.future, h.present] };
}

export function redo<T>(h: History<T>): History<T> {
  const next = h.future.at(-1);
  if (next === undefined) return h;
  return { past: [...h.past, h.present], present: next, future: h.future.slice(0, -1) };
}
