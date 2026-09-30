/** All sprite icons; a test checks they match the symbols in sprite.svg. */
export const ICON_IDS = [
  'undo',
  'redo',
  'sun',
  'moon',
  'arrow-down',
  'check',
  'share',
  'plus',
  'minus',
] as const;

/** Sprite path from the project root: Vite replaces it with the hashed file at build time. */
export const SPRITE_SRC = '/src/icons/sprite.svg';
