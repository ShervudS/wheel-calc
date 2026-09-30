import type { MessageKey } from './types.ts';

export const LANGS = ['ru', 'en'] as const;

export const DEFAULT_LANG = 'ru' satisfies (typeof LANGS)[number];

export const PLACEHOLDER = /\{(\w+)\}/g;

/**
 * Keys the UI needs in the browser. Only these are embedded in the page
 * (<script id="i18n">); all other texts are rendered into HTML at build time.
 * UI t() accepts only these keys, so a new key missing here is a compile error.
 */
export const RUNTIME_KEYS = [
  'meta.ogTitle',
  'theme.toLight',
  'theme.toDark',
  'unit.mm',
  'unit.in',
  'unit.mmValue',
  'unit.inValue',
  'number.decimal',
  'presets.option',
  'preset.group.factory',
  'preset.group.aftermarket',
  'preset.group.stretch',
  'x.hintMax',
  'x.hintLimited',
  'tire.result',
  'warn.stretchBad.title',
  'warn.stretchBad.body',
  'warn.stretch.title',
  'warn.stretch.body',
  'warn.narrowBad.title',
  'warn.narrowBad.body',
  'warn.wide.title',
  'warn.wide.body',
  'share.copied',
  'svg.ariaFull',
  'svg.ariaTire',
  'svg.outboard',
  'svg.inboard',
  'svg.dimDiameter',
  'svg.dimWidth',
  'svg.dimBackspacing',
  'svg.dimX',
  'svg.dimOffset',
  'svg.hotDiameter',
  'svg.hotWidth',
  'svg.hotOffset',
  'svg.hotX',
  'kb.D',
  'kb.W',
  'kb.ET',
  'kb.X',
  'kb.say',
  'kb.xMax',
] as const satisfies readonly MessageKey[];

export const RUNTIME_SCRIPT_ID = 'i18n';
