import { describe, expect, it } from 'vitest';
import { iconMarkup } from '../icon.ts';

describe('iconMarkup', () => {
  it('references the sprite symbol by id', () => {
    expect(iconMarkup('undo')).toContain('<use href="/src/icons/sprite.svg#undo"></use>');
  });

  it('decorative: hidden from screen readers and not focusable', () => {
    const svg = iconMarkup('check');
    expect(svg).toContain('aria-hidden="true"');
    expect(svg).toContain('focusable="false"');
  });

  it('has a class and data-icon for styles and scripts', () => {
    expect(iconMarkup('plus')).toMatch(/class="icon icon-plus" data-icon="plus"/);
  });
});
