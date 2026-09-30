import { toUnit } from '../../core/units/convert.ts';
import type { Unit } from '../../core/units/types.ts';
import { round } from '../../core/utils/round.ts';
import type { Translate } from '../../i18n/types.ts';

/** Length on the diagram: mm as integers, inches to hundredths. */
export function lenText(mm: number, unit: Unit, t: Translate): string {
  return unit === 'mm'
    ? t('unit.mmValue', { value: Math.round(mm) })
    : t('unit.inValue', { value: round(toUnit(mm, 'in'), 2) });
}

/** Tire sizes: mm as integers, inches to tenths. */
export function tireLenText(mm: number, unit: Unit, t: Translate): string {
  return unit === 'mm'
    ? t('unit.mmValue', { value: Math.round(mm) })
    : t('unit.inValue', { value: round(toUnit(mm, 'in'), 1) });
}

/** A value always in mm (offset, X-factor). */
export function mmText(v: number, t: Translate, digits = 0): string {
  return t('unit.mmValue', { value: round(v, digits) });
}

/** Signed offset: "+35", "-12", "0". */
export function signedEt(et: number): string {
  const v = round(et, 1);
  return (v > 0 ? '+' : '') + String(v);
}

/** Number with the language decimal separator: 8,5 or 8.5. */
export function localNumber(v: number, t: Translate): string {
  return String(v).replace('.', t('number.decimal'));
}
