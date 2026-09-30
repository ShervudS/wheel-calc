import { LANGS, PLACEHOLDER, RUNTIME_KEYS } from './constants.ts';
import type { Lang, Messages, Params, RuntimeKey, RuntimeMessages } from './types.ts';

/** Replaces {name} from params. Unknown placeholders are left as is. */
export function interpolate(template: string, params: Params = {}): string {
  return template.replace(PLACEHOLDER, (m, name: string) =>
    Object.hasOwn(params, name) ? String(params[name]) : m,
  );
}

/** Placeholder names in a text, sorted. */
export function placeholders(template: string): string[] {
  return [...template.matchAll(PLACEHOLDER)].map((m) => m[1] ?? '').toSorted();
}

export function isLang(v: unknown): v is Lang {
  return typeof v === 'string' && (LANGS as readonly string[]).includes(v);
}

/** Keeps only the UI keys of a full dictionary. */
export function pickRuntime(messages: Messages): RuntimeMessages {
  return Object.fromEntries(RUNTIME_KEYS.map((k) => [k, messages[k]])) as Record<
    RuntimeKey,
    string
  >;
}

/** UI keys from the page JSON. Every key must be a string, otherwise throws. */
export function parseRuntimeMessages(raw: string): RuntimeMessages {
  const data: unknown = JSON.parse(raw);
  if (typeof data !== 'object' || data === null) throw new Error('i18n: expected an object');
  const record = data as Record<string, unknown>;
  const missing = RUNTIME_KEYS.filter((k) => typeof record[k] !== 'string');
  if (missing.length > 0) throw new Error(`i18n: missing keys ${missing.join(', ')}`);
  return pickRuntime(record as Messages);
}
