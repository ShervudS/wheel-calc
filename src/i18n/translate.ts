import type { RuntimeMessages, Translate } from './types.ts';
import { interpolate } from './utils.ts';

/** Translator over UI keys: t('key', { name: value }). Does not import dictionaries. */
export function createTranslator(messages: RuntimeMessages): Translate {
  return (key, params) => interpolate(messages[key], params);
}
