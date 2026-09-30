import { SPRITE_SRC } from './constants.ts';
import type { IconId } from './types.ts';

/**
 * Icon markup from the sprite. Icons are decorative (the label stays as text), hence
 * aria-hidden and focusable="false" (otherwise old browsers put the SVG in the tab order).
 */
export function iconMarkup(id: IconId): string {
  return `<svg class="icon icon-${id}" data-icon="${id}" aria-hidden="true" focusable="false"><use href="${SPRITE_SRC}#${id}"></use></svg>`;
}
