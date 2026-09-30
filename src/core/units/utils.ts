import { round } from '../utils/round.ts';
import { INCH, MM_DIGITS } from './constants.ts';

export function normalizeMm(v: number): number {
  return round(v, MM_DIGITS);
}

/** Inches to normalized millimetres. */
export function inches(n: number): number {
  return normalizeMm(n * INCH);
}
