import type { WheelState } from '../types/wheelState.ts';
import { round } from '../utils/round.ts';
import type { Unit } from '../units/types.ts';
import { DEFAULT_STATE } from '../wheel/constants.ts';
import { constrain } from '../wheel/constrain.ts';
import { LENGTH_DIGITS, QUERY_KEYS as K, TIRE_ON } from './constants.ts';
import type { UrlState } from './types.ts';
import { parseUnit, readNumber } from './utils.ts';

/** d, w, et, x, u; plus t, tw, ta when the tire is shown. */
export function toQuery(s: Readonly<WheelState>, unit: Unit): string {
  const q = new URLSearchParams();
  q.set(K.D, String(round(s.D, LENGTH_DIGITS)));
  q.set(K.W, String(round(s.W, LENGTH_DIGITS)));
  q.set(K.ET, String(round(s.ET, LENGTH_DIGITS)));
  q.set(K.X, String(round(s.X, LENGTH_DIGITS)));
  q.set(K.unit, unit);
  if (s.tire) {
    q.set(K.tire, TIRE_ON);
    q.set(K.tw, String(Math.round(s.tw)));
    q.set(K.ta, String(Math.round(s.ta)));
  }
  return q.toString();
}

/** Parses a query string. Garbage is ignored, values are clamped to limits. */
export function fromQuery(
  search: string,
  fallback: Readonly<WheelState> = DEFAULT_STATE,
): UrlState {
  const q = new URLSearchParams(search);
  const pick = (key: string, def: number) => readNumber(q, key) ?? def;
  const raw: WheelState = {
    D: pick(K.D, fallback.D),
    W: pick(K.W, fallback.W),
    ET: pick(K.ET, fallback.ET),
    X: pick(K.X, fallback.X),
    tire: q.has(K.tire) ? q.get(K.tire) === TIRE_ON : fallback.tire,
    tw: pick(K.tw, fallback.tw),
    ta: pick(K.ta, fallback.ta),
  };
  return { state: constrain(raw).state, unit: parseUnit(q.get(K.unit)) };
}
