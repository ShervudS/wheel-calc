import { DICTS } from './dictionaries.ts';
import { createTranslator } from './translate.ts';
import type { Lang, Translate } from './types.ts';
import { pickRuntime } from './utils.ts';

/**
 * Translator straight from a language dictionary, for build and tests.
 * Dictionaries never reach the browser; there the keys are read from the page.
 */
export function createT(lang: Lang): Translate {
  return createTranslator(pickRuntime(DICTS[lang]));
}
