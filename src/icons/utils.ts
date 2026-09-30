import { ICON_IDS } from './constants.ts';
import type { IconId } from './types.ts';

export function isIconId(v: unknown): v is IconId {
  return typeof v === 'string' && (ICON_IDS as readonly string[]).includes(v);
}
