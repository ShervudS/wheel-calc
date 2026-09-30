import type { WheelState } from '../../core/types/wheelState.ts';
import type { Unit } from '../../core/units/types.ts';
import { round } from '../../core/utils/round.ts';
import type { Translate } from '../../i18n/types.ts';
import type { HotKey } from '../types/hotKey.ts';
import { lenText, mmText } from '../utils/format.ts';
import { KB_NAMES } from './constants.ts';

/** Diagram description for screen readers. */
export function svgAriaLabel(s: Readonly<WheelState>, unit: Unit, t: Translate): string {
  return t('svg.ariaFull', {
    d: lenText(s.D, unit, t),
    w: lenText(s.W, unit, t),
    et: round(s.ET, 1),
    x: round(s.X, 1),
    tire: s.tire ? t('svg.ariaTire', { tw: s.tw, ta: s.ta }) : '',
  });
}

/** What to announce after a keyboard change. */
export function kbAnnouncement(
  key: HotKey,
  s: Readonly<WheelState>,
  unit: Unit,
  xLimited: boolean,
  t: Translate,
): string {
  const value = key === 'D' || key === 'W' ? lenText(s[key], unit, t) : mmText(s[key], t, 1);
  return (
    t('kb.say', { name: t(KB_NAMES[key]), value }) + (key === 'X' && xLimited ? t('kb.xMax') : '')
  );
}
