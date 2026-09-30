import { round } from '../utils/round.ts';
import { INCH } from './constants.ts';
import type { Unit } from './types.ts';

export function toUnit(mm: number, unit: Unit): number {
  return unit === 'mm' ? mm : mm / INCH;
}

export function fromUnit(v: number, unit: Unit): number {
  return unit === 'mm' ? v : v * INCH;
}

/** Input field value: mm to tenths, inches to hundredths. */
export function inputValue(mm: number, unit: Unit): number {
  return unit === 'mm' ? round(mm, 1) : round(mm / INCH, 2);
}
