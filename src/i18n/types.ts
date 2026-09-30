import type { LANGS, RUNTIME_KEYS } from './constants.ts';
import type ru from './ru.json';

export type Lang = (typeof LANGS)[number];

/** Keys come from the Russian dictionary; the English one must have the same. */
export type MessageKey = keyof typeof ru;
export type Messages = Readonly<Record<MessageKey, string>>;

export type RuntimeKey = (typeof RUNTIME_KEYS)[number];
export type RuntimeMessages = Readonly<Record<RuntimeKey, string>>;

export type Params = Readonly<Record<string, string | number>>;
export type Translate = (key: RuntimeKey, params?: Params) => string;
