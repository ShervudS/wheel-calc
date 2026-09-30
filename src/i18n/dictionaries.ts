import en from './en.json' with { type: 'json' };
import ru from './ru.json' with { type: 'json' };
import type { Lang, Messages } from './types.ts';

/** en.json must contain every ru.json key: checked at compile time. */
export const DICTS: Readonly<Record<Lang, Messages>> = { ru, en: en satisfies Messages };
