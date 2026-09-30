import type { Unit } from '../units/types.ts';

/** Number from a query param; empty, non-numeric and infinite values give null. */
export function readNumber(q: URLSearchParams, key: string): number | null {
  const raw = q.get(key);
  if (raw === null || raw.trim() === '') return null;
  const v = Number(raw);
  return Number.isFinite(v) ? v : null;
}

/** Anything but "in" means millimetres. */
export function parseUnit(raw: string | null): Unit {
  return raw === 'in' ? 'in' : 'mm';
}
